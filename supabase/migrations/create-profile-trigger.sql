-- Create trigger to automatically create profile when user signs up
-- This ensures profiles are created even if the application code fails

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile for new user
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  -- Create default 'user' role
  insert into public.user_roles (user_id, role, granted_by)
  values (new.id, 'user', null)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop trigger if exists and create new one
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Also handle existing users that don't have profiles
-- This will create profiles for users that were created before the trigger was added
insert into public.profiles (id, full_name, username)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1))
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

-- Create default 'user' role for existing users that don't have roles
insert into public.user_roles (user_id, role, granted_by)
select 
  u.id,
  'user',
  null
from auth.users u
where not exists (
  select 1 from public.user_roles ur where ur.user_id = u.id and ur.role = 'user'
)
on conflict (user_id, role) do nothing;

