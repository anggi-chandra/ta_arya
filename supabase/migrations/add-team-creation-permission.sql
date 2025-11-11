-- Add can_create_team permission to profiles table
alter table if exists public.profiles
  add column if not exists can_create_team boolean default true;

-- Update RLS policy for teams to check can_create_team permission
drop policy if exists "authenticated can create team" on public.teams;
create policy "authenticated can create team" on public.teams 
  for insert 
  with check (
    auth.role() = 'authenticated' 
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and (can_create_team = true or can_create_team is null)
    )
  );

-- Allow admins and moderators to always create teams
create policy "admins and moderators can always create teams" on public.teams 
  for insert 
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
    )
  );

-- Add comment for documentation
comment on column public.profiles.can_create_team is 'Permission for user to create teams. Default is true (allowed).';
