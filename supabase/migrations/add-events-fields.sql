-- ============================================================================
-- MIGRATION: Add missing fields to events table
-- ============================================================================
-- This migration adds the 'game' and 'live_url' fields to the events table
-- Run this SQL in Supabase SQL Editor if these fields don't exist yet
-- ============================================================================

-- Add game field to events table (if not exists)
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS game text;

-- Add live_url field to events table (if not exists)
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS live_url text;

-- Verify the changes
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'events'
-- ORDER BY ordinal_position;

