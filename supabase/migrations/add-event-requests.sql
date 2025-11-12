-- Add event_requests table for user event creation requests
-- This migration creates the event_requests table similar to team_requests

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

-- RLS Policies
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

-- Indexes
create index if not exists event_requests_user_id_idx on public.event_requests(user_id);
create index if not exists event_requests_status_idx on public.event_requests(status);
create index if not exists event_requests_requested_at_idx on public.event_requests(requested_at desc);

