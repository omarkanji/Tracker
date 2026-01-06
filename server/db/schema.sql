-- Daily Tracker Database Schema

-- Create daily_entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id SERIAL PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,

  -- Sleep Goals
  bed_before_11pm BOOLEAN DEFAULT FALSE,
  eight_hours_sleep BOOLEAN DEFAULT FALSE,
  wake_by_730am BOOLEAN DEFAULT FALSE,

  -- Daily Health Goals
  workout BOOLEAN DEFAULT FALSE,
  ten_k_steps BOOLEAN DEFAULT FALSE,

  -- Daily Learning Items
  read_investing BOOLEAN DEFAULT FALSE,
  read_finance BOOLEAN DEFAULT FALSE,
  read_crypto BOOLEAN DEFAULT FALSE,
  play_with_ai BOOLEAN DEFAULT FALSE,

  -- General Reading
  reading_books BOOLEAN DEFAULT FALSE,

  -- Social Media
  posted_twitter BOOLEAN DEFAULT FALSE,
  posted_linkedin BOOLEAN DEFAULT FALSE,

  -- Stretch Goal
  person_reached_out TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on entry_date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(entry_date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_daily_entries_updated_at ON daily_entries;
CREATE TRIGGER update_daily_entries_updated_at
  BEFORE UPDATE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for streak calculations
CREATE OR REPLACE VIEW daily_streaks AS
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
