-- Add status column to events table
-- Status can be: 'draft', 'upcoming', 'ongoing', 'completed', 'cancelled'

-- Add status column if not exists
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'upcoming' 
  CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled'));

-- Update existing events to set status based on dates
-- Events that haven't started yet -> 'upcoming'
UPDATE public.events
SET status = 'upcoming'
WHERE status IS NULL 
  AND starts_at > NOW();

-- Events that are currently running -> 'ongoing'
UPDATE public.events
SET status = 'ongoing'
WHERE status IS NULL 
  AND starts_at <= NOW() 
  AND (ends_at IS NULL OR ends_at >= NOW());

-- Events that have ended -> 'completed'
UPDATE public.events
SET status = 'completed'
WHERE status IS NULL 
  AND ends_at IS NOT NULL 
  AND ends_at < NOW();

-- Set default for any remaining NULL values
UPDATE public.events
SET status = 'upcoming'
WHERE status IS NULL;

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- Add comment to column
COMMENT ON COLUMN public.events.status IS 'Event status: draft (not published), upcoming (scheduled), ongoing (in progress), completed (finished), cancelled (cancelled)';

