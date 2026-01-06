import express from 'express';
import pool from '../db/index.js';
import { format } from 'date-fns';
import { sendStreakCelebration } from '../services/whatsapp.js';

const router = express.Router();

/**
 * GET /api/tracking/today
 * Get today's entry or create empty one
 */
router.get('/today', async (req, res) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    const result = await pool.query(
      'SELECT * FROM daily_entries WHERE entry_date = $1',
      [today]
    );

    if (result.rows.length === 0) {
      // Return empty entry structure
      return res.json({
        entry_date: today,
        bed_before_11pm: false,
        eight_hours_sleep: false,
        wake_by_730am: false,
        workout: false,
        ten_k_steps: false,
        read_investing: false,
        read_finance: false,
        read_crypto: false,
        play_with_ai: false,
        reading_books: false,
        posted_twitter: false,
        posted_linkedin: false,
        person_reached_out: ''
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching today\'s entry:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

/**
 * POST /api/tracking/submit
 * Submit or update daily entry
 */
router.post('/submit', async (req, res) => {
  try {
    const {
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
      person_reached_out
    } = req.body;

    const dateToUse = entry_date || format(new Date(), 'yyyy-MM-dd');

    // Upsert (insert or update if exists)
    const result = await pool.query(
      `INSERT INTO daily_entries (
        entry_date, bed_before_11pm, eight_hours_sleep, wake_by_730am,
        workout, ten_k_steps, read_investing, read_finance, read_crypto, play_with_ai,
        reading_books, posted_twitter, posted_linkedin, person_reached_out
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (entry_date)
      DO UPDATE SET
        bed_before_11pm = EXCLUDED.bed_before_11pm,
        eight_hours_sleep = EXCLUDED.eight_hours_sleep,
        wake_by_730am = EXCLUDED.wake_by_730am,
        workout = EXCLUDED.workout,
        ten_k_steps = EXCLUDED.ten_k_steps,
        read_investing = EXCLUDED.read_investing,
        read_finance = EXCLUDED.read_finance,
        read_crypto = EXCLUDED.read_crypto,
        play_with_ai = EXCLUDED.play_with_ai,
        reading_books = EXCLUDED.reading_books,
        posted_twitter = EXCLUDED.posted_twitter,
        posted_linkedin = EXCLUDED.posted_linkedin,
        person_reached_out = EXCLUDED.person_reached_out,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        dateToUse, bed_before_11pm, eight_hours_sleep, wake_by_730am,
        workout, ten_k_steps, read_investing, read_finance, read_crypto, play_with_ai,
        reading_books, posted_twitter, posted_linkedin, person_reached_out
      ]
    );

    // Check for streaks and send celebration if milestone reached
    const streakResult = await pool.query(
      `SELECT COUNT(*) as streak_days
       FROM daily_entries
       WHERE entry_date <= $1
       AND (bed_before_11pm OR eight_hours_sleep OR wake_by_730am OR
            workout OR ten_k_steps OR play_with_ai OR read_investing OR read_finance OR
            read_crypto OR posted_twitter OR posted_linkedin OR reading_books OR
            (person_reached_out IS NOT NULL AND person_reached_out != ''))`,
      [dateToUse]
    );

    const streakDays = parseInt(streakResult.rows[0].streak_days);

    // Send celebration for milestone streaks
    await sendStreakCelebration(streakDays);

    res.json({
      success: true,
      entry: result.rows[0],
      streak_days: streakDays
    });
  } catch (error) {
    console.error('Error submitting entry:', error);
    res.status(500).json({ error: 'Failed to submit entry' });
  }
});

/**
 * GET /api/tracking/history?days=30
 * Get historical entries
 */
router.get('/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const result = await pool.query(
      `SELECT * FROM daily_entries
       ORDER BY entry_date DESC
       LIMIT $1`,
      [days]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
