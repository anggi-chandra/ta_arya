-- Migration: Remove max_participants column from events table
-- This migration removes the max_participants column from the events table
-- as it is no longer needed in the application

-- Drop the column
ALTER TABLE public.events DROP COLUMN IF EXISTS max_participants;

-- Note: This will permanently remove the max_participants column and all its data
-- Make sure to backup your data before running this migration if needed

