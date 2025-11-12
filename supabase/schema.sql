-- Profiles (extend auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  can_create_team boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles are readable by everyone" on public.profiles for select using (true);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
-- Allow admins and moderators to update team creation permission
create policy "admins can update team permission" on public.profiles 
  for update 
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );

-- Teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  game text not null,
  logo_url text,
  description text,
  recruiting boolean default false,
  created_at timestamptz default now()
);

alter table public.teams enable row level security;
create policy "teams readable" on public.teams for select using (true);
create policy "team owners can modify" on public.teams for update using (auth.uid() = owner_id);
-- Allow admins and moderators to always create teams (when approving requests)
create policy "admins and moderators can always create teams" on public.teams 
  for insert 
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );
-- Note: Regular users can no longer create teams directly
-- They must submit a request through team_requests table
-- The old policy for regular users is removed to enforce this workflow

-- Team requests (for user team creation requests)
create table if not exists public.team_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  game text not null,
  logo_url text,
  description text,
  recruiting boolean default false,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  rejection_reason text,
  created_at timestamptz default now()
);

alter table public.team_requests enable row level security;
create policy "users can view own requests" on public.team_requests
  for select
  using (auth.uid() = user_id);
create policy "users can create requests" on public.team_requests
  for insert
  with check (auth.uid() = user_id);
create policy "admins can view all requests" on public.team_requests
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );
create policy "admins can update requests" on public.team_requests
  for update
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );

create index if not exists team_requests_user_id_idx on public.team_requests(user_id);
create index if not exists team_requests_status_idx on public.team_requests(status);
create index if not exists team_requests_requested_at_idx on public.team_requests(requested_at desc);

-- Team members
create table if not exists public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

alter table public.team_members enable row level security;
create policy "memberships readable" on public.team_members for select using (true);
create policy "team owners can manage members" on public.team_members for all using (
  exists (select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
);

-- Events (for spectators/attendees)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  game text,
  image_url text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price_cents int default 0,
  capacity int,
  ticket_types jsonb,
  check_in_required boolean default true,
  tournament_id uuid, -- Will be added as foreign key after tournaments table is created
  live_url text,
  status text default 'upcoming' check (status in ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events enable row level security;
create policy "events readable" on public.events for select using (true);
create policy "event creators can modify" on public.events for update using (auth.uid() = created_by);
create policy "admins and moderators can modify events" on public.events for update using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
    and ur.role in ('admin', 'moderator')
  )
);
create policy "authenticated can create events" on public.events for insert with check (auth.role() = 'authenticated');
create policy "admins and moderators can delete events" on public.events for delete using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
    and ur.role in ('admin', 'moderator')
  )
);
create policy "event creators can delete" on public.events for delete using (auth.uid() = created_by);

-- Event requests (for user event creation requests)
create table if not exists public.event_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  game text,
  image_url text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price_cents int default 0,
  capacity int,
  live_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  rejection_reason text,
  created_at timestamptz default now()
);

alter table public.event_requests enable row level security;
create policy "users can view own requests" on public.event_requests
  for select
  using (auth.uid() = user_id);
create policy "users can create requests" on public.event_requests
  for insert
  with check (auth.uid() = user_id);
create policy "admins can view all requests" on public.event_requests
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );
create policy "admins can update requests" on public.event_requests
  for update
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );

create index if not exists event_requests_user_id_idx on public.event_requests(user_id);
create index if not exists event_requests_status_idx on public.event_requests(status);
create index if not exists event_requests_requested_at_idx on public.event_requests(requested_at desc);

-- Event registrations
create table if not exists public.event_registrations (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text default 'registered',
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

alter table public.event_registrations enable row level security;
create policy "registrations readable" on public.event_registrations for select using (true);
create policy "users manage own registration" on public.event_registrations for all using (auth.uid() = user_id);

-- Event tickets (individual tickets with QR codes)
create table if not exists public.event_tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticket_type text default 'regular',
  price_cents int not null,
  qr_code text unique not null,
  status text default 'active' check (status in ('active', 'used', 'cancelled', 'transferred')),
  purchased_at timestamptz default now(),
  used_at timestamptz,
  checked_in_at timestamptz,
  transferred_to uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_event_tickets_event_id on public.event_tickets(event_id);
create index idx_event_tickets_user_id on public.event_tickets(user_id);
create index idx_event_tickets_qr_code on public.event_tickets(qr_code);
create index idx_event_tickets_status on public.event_tickets(status);

alter table public.event_tickets enable row level security;
create policy "tickets readable by owner and event organizers" on public.event_tickets 
  for select using (
    auth.uid() = user_id 
    or auth.uid() = transferred_to
    or exists (
      select 1 from public.events e
      where e.id = event_id 
      and (e.created_by = auth.uid() or exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
        and ur.role in ('admin', 'moderator')
      ))
    )
  );
create policy "users can create own tickets" on public.event_tickets 
  for insert with check (auth.uid() = user_id);
create policy "users can update own tickets" on public.event_tickets 
  for update using (auth.uid() = user_id or auth.uid() = transferred_to);
create policy "admins and moderators can manage all tickets" on public.event_tickets 
  for all using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );

-- Event check-ins
create table if not exists public.event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  ticket_id uuid references public.event_tickets(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  checked_in_at timestamptz default now(),
  checked_in_by uuid references auth.users(id) on delete set null,
  location text,
  notes text
);

create index idx_event_checkins_event_id on public.event_checkins(event_id);
create index idx_event_checkins_ticket_id on public.event_checkins(ticket_id);
create index idx_event_checkins_user_id on public.event_checkins(user_id);
create index idx_event_checkins_checked_in_at on public.event_checkins(checked_in_at);

alter table public.event_checkins enable row level security;
create policy "checkins readable by event organizers and ticket owners" on public.event_checkins 
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.events e
      where e.id = event_id 
      and (e.created_by = auth.uid() or exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
        and ur.role in ('admin', 'moderator')
      ))
    )
  );
create policy "event organizers can create checkins" on public.event_checkins 
  for insert with check (
    exists (
      select 1 from public.events e
      where e.id = event_id 
      and (e.created_by = auth.uid() or exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
        and ur.role in ('admin', 'moderator')
      ))
    )
  );

-- Helper view: event stats (backward compatibility)
create or replace view public.event_stats as
select e.id as event_id,
       count(distinct r.user_id) as participants,
       count(distinct et.id) as tickets_sold
from public.events e
left join public.event_registrations r on r.event_id = e.id
left join public.event_tickets et on et.event_id = e.id and et.status != 'cancelled'
group by e.id;

-- Event ticket stats view
create or replace view public.event_ticket_stats as
select 
  e.id as event_id,
  e.title as event_title,
  e.capacity,
  count(distinct et.id) as tickets_sold,
  count(distinct case when et.status = 'active' then et.id end) as active_tickets,
  count(distinct case when et.status = 'used' then et.id end) as used_tickets,
  count(distinct ec.id) as check_ins_count,
  coalesce(sum(case when et.status != 'cancelled' then et.price_cents else 0 end), 0) as total_revenue_cents,
  case 
    when e.capacity is not null then e.capacity - count(distinct et.id)
    else null
  end as available_seats
from public.events e
left join public.event_tickets et on et.event_id = e.id
left join public.event_checkins ec on ec.ticket_id = et.id
group by e.id, e.title, e.capacity;

-- User roles and permissions
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator', 'vip', 'user')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz default now(),
  unique(user_id, role)
);

alter table public.user_roles enable row level security;
create policy "roles readable by admins" on public.user_roles for select using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);
create policy "admins can manage roles" on public.user_roles for all using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

-- Content management (blog, articles, news)
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  featured_image text,
  type text not null check (type in ('blog', 'news', 'article', 'page')),
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.content enable row level security;
create policy "published content readable" on public.content for select using (status = 'published' or auth.uid() = author_id);
create policy "authors can manage own content" on public.content for all using (auth.uid() = author_id);
create policy "admins can manage all content" on public.content for all using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

-- Media management
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  url text not null,
  alt_text text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.media enable row level security;
create policy "media readable" on public.media for select using (true);
create policy "authenticated can upload media" on public.media for insert with check (auth.role() = 'authenticated');
create policy "uploaders can manage own media" on public.media for all using (auth.uid() = uploaded_by);

-- Forum categories
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  slug text unique not null,
  color text default '#3b82f6',
  icon text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.forum_categories enable row level security;
create policy "categories readable" on public.forum_categories for select using (is_active = true);
create policy "admins can manage categories" on public.forum_categories for all using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

-- Forum topics
create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete cascade,
  title text not null,
  content text not null,
  author_id uuid references auth.users(id) on delete set null,
  is_pinned boolean default false,
  is_locked boolean default false,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.forum_topics enable row level security;
create policy "topics readable" on public.forum_topics for select using (true);
create policy "authenticated can create topics" on public.forum_topics for insert with check (auth.role() = 'authenticated');
create policy "authors can edit own topics" on public.forum_topics for update using (auth.uid() = author_id);
create policy "moderators can manage topics" on public.forum_topics for all using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'moderator'))
);

-- Forum replies
create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.forum_topics(id) on delete cascade,
  content text not null,
  author_id uuid references auth.users(id) on delete set null,
  parent_id uuid references public.forum_replies(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.forum_replies enable row level security;
create policy "replies readable" on public.forum_replies for select using (true);
create policy "authenticated can reply" on public.forum_replies for insert with check (auth.role() = 'authenticated');
create policy "authors can edit own replies" on public.forum_replies for update using (auth.uid() = author_id);
create policy "moderators can manage replies" on public.forum_replies for all using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'moderator'))
);

-- Team achievements
create table if not exists public.team_achievements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  title text not null,
  description text,
  achievement_date date not null,
  rank_position int,
  prize_amount decimal(10,2),
  tournament_name text,
  created_at timestamptz default now()
);

alter table public.team_achievements enable row level security;
create policy "achievements readable" on public.team_achievements for select using (true);
create policy "team owners can manage achievements" on public.team_achievements for all using (
  exists (select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
);

-- User reports and moderation
create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reported_user_id uuid references auth.users(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.user_reports enable row level security;
create policy "moderators can view reports" on public.user_reports for select using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'moderator'))
);
create policy "authenticated can report users" on public.user_reports for insert with check (auth.role() = 'authenticated');
create policy "moderators can manage reports" on public.user_reports for update using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'moderator'))
);

-- Website settings
create table if not exists public.website_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now()
);

alter table public.website_settings enable row level security;
create policy "settings readable" on public.website_settings for select using (true);
create policy "admins can manage settings" on public.website_settings for all using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  is_read boolean default false,
  action_url text,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "admins can create notifications" on public.notifications for insert with check (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

-- Website analytics
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  page_path text,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  ip_address inet,
  user_agent text,
  referrer text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;
create policy "admins can view analytics" on public.analytics_events for select using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

-- Functions and triggers
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger update_content_updated_at before update on public.content
  for each row execute procedure public.update_updated_at_column();

create trigger update_forum_topics_updated_at before update on public.forum_topics
  for each row execute procedure public.update_updated_at_column();

create trigger update_forum_replies_updated_at before update on public.forum_replies
  for each row execute procedure public.update_updated_at_column();

-- Insert default admin role for first user
insert into public.website_settings (key, value, description) values
('site_name', '"Esports Community"', 'Website name'),
('site_description', '"Platform komunitas esports terbaik"', 'Website description'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('registration_enabled', 'true', 'Enable/disable user registration'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('allowed_file_types', '["image/jpeg", "image/png", "image/gif", "image/webp"]', 'Allowed file MIME types')
on conflict (key) do nothing;

-- Schema adjustments to align with implemented APIs
-- Media: add description, file_path, and updated_at for metadata and storage management
alter table if exists public.media
  add column if not exists description text,
  add column if not exists file_path text,
  add column if not exists updated_at timestamptz default now();

-- Forum topics: add slug and last_reply_at to support URL slugs and reply tracking
alter table if exists public.forum_topics
  add column if not exists slug text unique,
  add column if not exists last_reply_at timestamptz;

-- Events: add game to support analytics on game popularity
alter table if exists public.events
  add column if not exists game text;

-- Events: add live_url for streaming/live event links
alter table if exists public.events
  add column if not exists live_url text;

-- Notification functions and triggers
-- Create notifications automatically when important rows are inserted

-- Event registration notification
create or replace function public.notify_event_registration()
returns trigger as $$
declare
  notif_title text;
  notif_message text;
  action_link text;
begin
  notif_title := 'Pendaftaran Berhasil';
  notif_message := 'Kamu berhasil mendaftar ke event.';
  action_link := '/events/' || NEW.event_id::text;

  insert into public.notifications (user_id, title, message, type, is_read, action_url)
  values (NEW.user_id, notif_title, notif_message, 'success', false, action_link);

  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_event_registration on public.event_registrations;
create trigger trg_notify_event_registration
after insert on public.event_registrations
for each row execute procedure public.notify_event_registration();

-- Team member join notification
create or replace function public.notify_team_member_join()
returns trigger as $$
declare
  team_owner uuid;
  team_name text;
begin
  select t.owner_id, t.name into team_owner, team_name
  from public.teams t
  where t.id = NEW.team_id;

  -- Notify team owner about new member
  if team_owner is not null then
    insert into public.notifications (user_id, title, message, type, is_read, action_url)
    values (
      team_owner,
      'Anggota Baru Bergabung',
      coalesce(team_name, 'Tim') || ': anggota baru telah bergabung.',
      'info',
      false,
      '/teams/' || NEW.team_id::text
    );
  end if;

  -- Notify joining user
  insert into public.notifications (user_id, title, message, type, is_read, action_url)
  values (
    NEW.user_id,
    'Berhasil Bergabung Tim',
    'Kamu bergabung ke tim ' || coalesce(team_name, '') || '.',
    'success',
    false,
    '/teams/' || NEW.team_id::text
  );

  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_team_member_join on public.team_members;
create trigger trg_notify_team_member_join
after insert on public.team_members
for each row execute procedure public.notify_team_member_join();

-- Forum reply notification (notify topic author)
create or replace function public.notify_forum_reply()
returns trigger as $$
declare
  topic_author uuid;
  topic_title text;
  category_id uuid;
  action_link text;
begin
  select ft.author_id, ft.title, ft.category_id into topic_author, topic_title, category_id
  from public.forum_topics ft
  where ft.id = NEW.topic_id;

  if topic_author is not null then
    action_link := '/community/forum/' || category_id::text || '/' || NEW.topic_id::text;
    insert into public.notifications (user_id, title, message, type, is_read, action_url)
    values (
      topic_author,
      'Balasan Baru di Topik',
      'Topik "' || coalesce(topic_title, '') || '" mendapat balasan baru.',
      'info',
      false,
      action_link
    );
  end if;

  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

DROP TRIGGER IF EXISTS trg_notify_forum_reply ON public.forum_replies;
create trigger trg_notify_forum_reply
after insert on public.forum_replies
for each row execute procedure public.notify_forum_reply();

-- Tournaments table (dedicated tournament management)
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  game text not null,
  tournament_type text not null check (tournament_type in ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  format text not null check (format in ('1v1', '2v2', '3v3', '4v4', '5v5', 'custom')),
  max_participants int not null,
  prize_pool int default 0,
  currency text default 'IDR',
  entry_fee int default 0,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  registration_deadline timestamptz not null,
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  rules text,
  banner_url text,
  organizer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tournaments enable row level security;
create policy "tournaments readable" on public.tournaments for select using (true);
create policy "authenticated can create tournaments" on public.tournaments for insert with check (auth.role() = 'authenticated');
create policy "organizers can update own tournaments" on public.tournaments for update using (auth.uid() = organizer_id);
create policy "organizers can delete own tournaments" on public.tournaments for delete using (auth.uid() = organizer_id);
create policy "admins and moderators can delete tournaments" on public.tournaments for delete using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
    and ur.role in ('admin', 'moderator')
  )
);
create policy "admins and moderators can update tournaments" on public.tournaments for update using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
    and ur.role in ('admin', 'moderator')
  )
);

-- Add foreign key constraint for events.tournament_id (after tournaments table is created)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_tournament_id_fkey'
  ) then
    alter table public.events 
      add constraint events_tournament_id_fkey 
      foreign key (tournament_id) 
      references public.tournaments(id) 
      on delete set null;
  end if;
end $$;

-- Tournament participants
create table if not exists public.tournament_participants (
  tournament_id uuid references public.tournaments(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  status text default 'registered' check (status in ('registered', 'checked_in', 'eliminated', 'withdrawn')),
  seed int,
  checked_in_at timestamptz,
  registered_at timestamptz default now(),
  primary key (tournament_id, team_id)
);

alter table public.tournament_participants enable row level security;
create policy "participants readable" on public.tournament_participants for select using (true);
create policy "team owners can register team" on public.tournament_participants for insert with check (
  exists (select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
);
create policy "organizers can manage participants" on public.tournament_participants for all using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
);

-- Tournament matches
create table if not exists public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  round int not null,
  match_number int not null,
  team1_id uuid references public.teams(id) on delete set null,
  team2_id uuid references public.teams(id) on delete set null,
  winner_id uuid references public.teams(id) on delete set null,
  score_team1 int default 0,
  score_team2 int default 0,
  status text default 'pending' check (status in ('pending', 'ongoing', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now(),
  unique(tournament_id, round, match_number)
);

alter table public.tournament_matches enable row level security;
create policy "matches readable" on public.tournament_matches for select using (true);
create policy "organizers can manage matches" on public.tournament_matches for all using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
);

-- Tournament stats view
create or replace view public.tournament_stats as
select t.id as tournament_id,
       t.title as tournament_title,
       count(p.team_id) as total_participants,
       count(case when p.status = 'registered' then 1 end) as registered_teams,
       count(case when p.status = 'checked_in' then 1 end) as checked_in_teams,
       count(case when p.status = 'eliminated' then 1 end) as eliminated_teams,
       count(m.id) as total_matches,
       count(case when m.status = 'completed' then 1 end) as completed_matches
from public.tournaments t
left join public.tournament_participants p on p.tournament_id = t.id
left join public.tournament_matches m on m.tournament_id = t.id
group by t.id, t.title;

-- ============================================================================
-- STORAGE BUCKET POLICIES
-- ============================================================================
-- Storage policies for 'uploads' bucket
-- Note: Bucket 'uploads' must be created in Supabase Storage dashboard first
-- 
-- IMPORTANT: 
-- - If using service_role key in API routes, these policies may not be needed
--   as service_role bypasses all RLS policies
-- - These policies provide additional security layer
-- - See supabase/storage-policies.sql for detailed setup instructions
-- ============================================================================

-- Policy 1: Allow public read access to uploads bucket
-- Anyone can view/download files from the uploads bucket (for displaying images)
CREATE POLICY IF NOT EXISTS "Allow public read access to uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Policy 2: Allow authenticated users to upload files to uploads bucket
-- Only authenticated users (logged in users) can upload files
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy 3: Allow authenticated users to update files in uploads bucket
-- Authenticated users can update/replace files in the bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Policy 4: Allow authenticated users to delete files in uploads bucket
-- Authenticated users can delete files from the bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- ============================================================================
-- ALTERNATIVE: Admin/Moderator Only Policies (More Secure)
-- ============================================================================
-- Uncomment the policies below and comment out policies above if you want
-- only admins/moderators to manage uploads

-- DROP POLICY IF EXISTS "Allow authenticated uploads to uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to update uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete uploads" ON storage.objects;

-- Policy: Allow admins and moderators to manage all uploads
-- CREATE POLICY IF NOT EXISTS "Allow admins to manage all uploads"
-- ON storage.objects
-- FOR ALL
-- TO authenticated
-- USING (
--   bucket_id = 'uploads' 
--   AND EXISTS (
--     SELECT 1 FROM public.user_roles ur 
--     WHERE ur.user_id = auth.uid() 
--     AND ur.role IN ('admin', 'moderator')
--   )
-- )
-- WITH CHECK (
--   bucket_id = 'uploads' 
--   AND EXISTS (
--     SELECT 1 FROM public.user_roles ur 
--     WHERE ur.user_id = auth.uid() 
--     AND ur.role IN ('admin', 'moderator')
--   )
-- );

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Bucket Creation: Create 'uploads' bucket in Supabase Storage dashboard first
-- 2. Service Role Key: If using service_role key, policies are optional but recommended
-- 3. File Structure: Files stored as uploads/events/, uploads/tournaments/, etc.
-- 4. For detailed setup instructions, see: supabase/storage-policies.sql
-- ============================================================================