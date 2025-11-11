-- Migration: Add RLS policies for admin and moderator to delete and update tournaments
-- This allows admin and moderator users to delete and update tournaments

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admins and moderators can delete tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "admins and moderators can update tournaments" ON public.tournaments;

-- Create policy for admin and moderator to delete tournaments
CREATE POLICY "admins and moderators can delete tournaments" ON public.tournaments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'moderator')
    )
  );

-- Create policy for admin and moderator to update tournaments
CREATE POLICY "admins and moderators can update tournaments" ON public.tournaments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'moderator')
    )
  );

