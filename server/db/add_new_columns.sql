-- Migration to add new columns to existing daily_entries table

-- Add new health goal column
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS ten_k_steps BOOLEAN DEFAULT FALSE;

-- Add stretch goal column
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS person_reached_out TEXT;

-- Update the view with new columns
DROP VIEW IF EXISTS daily_streaks;

CREATE VIEW daily_streaks AS
WITH all_goals AS (
  SELECT
    entry_date,
    bed_before_11pm,
    eight_hours_sleep,
    wake_by_730am,
    workout,
    ten_k_steps,
    read_investing,
    read_finance,
    read_crypto,
    play_with_ai,
    reading_books,
    posted_twitter,
    posted_linkedin,
    person_reached_out,
    -- Calculate if all daily learning items completed
    (play_with_ai AND read_investing AND read_finance AND read_crypto) as daily_learning_complete,
    -- Calculate total activities completed (excluding text field)
    (CASE WHEN bed_before_11pm THEN 1 ELSE 0 END +
     CASE WHEN eight_hours_sleep THEN 1 ELSE 0 END +
     CASE WHEN wake_by_730am THEN 1 ELSE 0 END +
     CASE WHEN workout THEN 1 ELSE 0 END +
     CASE WHEN ten_k_steps THEN 1 ELSE 0 END +
     CASE WHEN play_with_ai THEN 1 ELSE 0 END +
     CASE WHEN read_investing THEN 1 ELSE 0 END +
     CASE WHEN read_finance THEN 1 ELSE 0 END +
     CASE WHEN read_crypto THEN 1 ELSE 0 END +
     CASE WHEN posted_twitter THEN 1 ELSE 0 END +
     CASE WHEN posted_linkedin THEN 1 ELSE 0 END +
     CASE WHEN reading_books THEN 1 ELSE 0 END +
     CASE WHEN person_reached_out IS NOT NULL AND person_reached_out != '' THEN 1 ELSE 0 END) as total_completed
  FROM daily_entries
  ORDER BY entry_date DESC
)
SELECT * FROM all_goals;
