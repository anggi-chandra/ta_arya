-- Create team_requests table for team creation requests
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

-- Enable RLS
alter table public.team_requests enable row level security;

-- Users can view their own requests
create policy "users can view own requests" on public.team_requests
  for select
  using (auth.uid() = user_id);

-- Users can create requests
create policy "users can create requests" on public.team_requests
  for insert
  with check (auth.uid() = user_id);

-- Admins and moderators can view all requests
create policy "admins can view all requests" on public.team_requests
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );

-- Admins and moderators can update requests (approve/reject)
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

-- Create index for faster queries
create index if not exists team_requests_user_id_idx on public.team_requests(user_id);
create index if not exists team_requests_status_idx on public.team_requests(status);
create index if not exists team_requests_requested_at_idx on public.team_requests(requested_at desc);

-- Note: Team creation from approved request is handled in the API route
-- This allows for better error handling and validation

-- Add comment for documentation
comment on table public.team_requests is 'Team creation requests from users that need admin approval';
comment on column public.team_requests.status is 'Status of the request: pending, approved, or rejected';
comment on column public.team_requests.reviewed_by is 'Admin/moderator who reviewed the request';

