-- Migration: Add RLS policy for deleting events
-- This allows admin and moderator users to delete events
-- Event registrations will be automatically deleted via CASCADE

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "admins and moderators can delete events" ON public.events;

-- Create policy for admin and moderator to delete events
CREATE POLICY "admins and moderators can delete events" ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'moderator')
    )
  );

-- Note: Event creators can also delete their own events
-- This policy allows event creators to delete events they created
DROP POLICY IF EXISTS "event creators can delete" ON public.events;

CREATE POLICY "event creators can delete" ON public.events
  FOR DELETE
  USING (auth.uid() = created_by);

