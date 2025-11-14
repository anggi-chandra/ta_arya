-- Migration: Fix infinite recursion in user_roles RLS policy
-- 
-- Problem: The RLS policy on user_roles checks if user is admin by querying user_roles,
-- which requires the policy to be evaluated again, creating infinite recursion.
--
-- Solution: 
-- 1. Allow users to read their own roles (breaks recursion for own role check)
-- 2. Create a SECURITY DEFINER function to check admin status without recursion
-- 3. Update policies to use the function for admin checks

-- Step 1: Drop existing policies that cause recursion
DROP POLICY IF EXISTS "roles readable by admins" ON public.user_roles;
DROP POLICY IF EXISTS "admins can manage roles" ON public.user_roles;

-- Step 2: Create a SECURITY DEFINER function to check admin status
-- This function bypasses RLS, preventing recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = is_admin.user_id
    AND ur.role = 'admin'
  );
END;
$$;

-- Step 3: Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  );
END;
$$;

-- Step 4: Create new policies that avoid recursion
-- Policy 1: Users can read their own roles (prevents recursion - no query needed)
CREATE POLICY "users can read own roles" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Admins can read all roles (uses SECURITY DEFINER function to avoid recursion)
-- The function runs with elevated privileges and bypasses RLS, preventing recursion
CREATE POLICY "admins can read all roles" ON public.user_roles
  FOR SELECT
  USING (public.current_user_is_admin());

-- Policy 3: Admins can manage all roles (uses function to avoid recursion)
CREATE POLICY "admins can manage all roles" ON public.user_roles
  FOR ALL
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

-- Note: The SECURITY DEFINER function bypasses RLS when it queries user_roles,
-- so it won't trigger the policy recursively. This breaks the infinite recursion cycle.

