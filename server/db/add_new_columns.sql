-- Migration to add new columns to existing daily_entries table
-- This should only run once on existing databases

-- Drop the view first so we can modify the table
DROP VIEW IF EXISTS daily_streaks;

-- Add new health goal column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='daily_entries' AND column_name='ten_k_steps') THEN
        ALTER TABLE daily_entries ADD COLUMN ten_k_steps BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add stretch goal column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='daily_entries' AND column_name='person_reached_out') THEN
        ALTER TABLE daily_entries ADD COLUMN person_reached_out TEXT;
    END IF;
END $$;
