-- Migration: Add Event Ticket System
-- Description: Add capacity, ticket_types, check_in_required, and tournament_id to events table
-- Also create event_tickets and event_checkins tables

-- 1. Add new columns to events table
alter table public.events 
  add column if not exists capacity int,
  add column if not exists ticket_types jsonb,
  add column if not exists check_in_required boolean default true,
  add column if not exists tournament_id uuid,
  add column if not exists updated_at timestamptz default now();

-- Add foreign key constraint for tournament_id after tournaments table exists
-- This will be handled in schema.sql, but we can also add it here if tournaments table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'tournaments') then
    if not exists (
      select 1 from pg_constraint where conname = 'events_tournament_id_fkey'
    ) then
      alter table public.events 
        add constraint events_tournament_id_fkey 
        foreign key (tournament_id) 
        references public.tournaments(id) 
        on delete set null;
    end if;
  end if;
end $$;

-- Add comment to columns
comment on column public.events.capacity is 'Maximum number of attendees (seats/capacity)';
comment on column public.events.ticket_types is 'JSON object with ticket types and pricing: {"regular": {"price": 50000, "available": 100}, "vip": {"price": 150000, "available": 50}}';
comment on column public.events.check_in_required is 'Whether check-in is required for this event';
comment on column public.events.tournament_id is 'Optional link to related tournament (for viewing parties)';

-- 2. Create event_tickets table
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

-- Create indexes for event_tickets
create index if not exists idx_event_tickets_event_id on public.event_tickets(event_id);
create index if not exists idx_event_tickets_user_id on public.event_tickets(user_id);
create index if not exists idx_event_tickets_qr_code on public.event_tickets(qr_code);
create index if not exists idx_event_tickets_status on public.event_tickets(status);

-- Enable RLS for event_tickets
alter table public.event_tickets enable row level security;

-- RLS Policies for event_tickets
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

-- 3. Create event_checkins table
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

-- Create indexes for event_checkins
create index if not exists idx_event_checkins_event_id on public.event_checkins(event_id);
create index if not exists idx_event_checkins_ticket_id on public.event_checkins(ticket_id);
create index if not exists idx_event_checkins_user_id on public.event_checkins(user_id);
create index if not exists idx_event_checkins_checked_in_at on public.event_checkins(checked_in_at);

-- Enable RLS for event_checkins
alter table public.event_checkins enable row level security;

-- RLS Policies for event_checkins
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

-- 4. Create function to generate QR code
create or replace function public.generate_event_qr_code()
returns text as $$
declare
  qr_code text;
begin
  -- Generate unique QR code: EVT-XXXXXXXX-XXXX
  qr_code := 'EVT-' || upper(substring(md5(random()::text || clock_timestamp()::text || random()::text) from 1 for 8)) || '-' || 
             upper(substring(md5(random()::text || clock_timestamp()::text || random()::text) from 9 for 4));
  
  -- Check if QR code already exists (very unlikely, but just in case)
  while exists (select 1 from public.event_tickets where event_tickets.qr_code = qr_code) loop
    qr_code := 'EVT-' || upper(substring(md5(random()::text || clock_timestamp()::text || random()::text) from 1 for 8)) || '-' || 
               upper(substring(md5(random()::text || clock_timestamp()::text || random()::text) from 9 for 4));
  end loop;
  
  return qr_code;
end;
$$ language plpgsql;

-- 5. Create trigger to update updated_at for event_tickets
create or replace function public.update_event_tickets_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_update_event_tickets_updated_at
before update on public.event_tickets
for each row
execute function public.update_event_tickets_updated_at();

-- 6. Update event_registrations to be compatible with ticket system
-- Keep event_registrations for backward compatibility
-- But prefer using event_tickets for new registrations

-- 7. Create view for event statistics with tickets
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

-- 8. Add comments
comment on table public.event_tickets is 'Individual tickets for events with QR codes';
comment on table public.event_checkins is 'Check-in records for event tickets';
comment on view public.event_ticket_stats is 'Statistics for events including ticket sales and check-ins';

