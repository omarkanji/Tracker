import express from 'express';
import pool from '../db/index.js';
import { format, subDays } from 'date-fns';

const router = express.Router();

/**
 * GET /api/analytics/overview
 * Get overview statistics
 */
router.get('/overview', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

    const result = await pool.query(
      `SELECT
        COUNT(*) as total_days,
        SUM(CASE WHEN bed_before_11pm THEN 1 ELSE 0 END) as bed_before_11pm_count,
        SUM(CASE WHEN eight_hours_sleep THEN 1 ELSE 0 END) as eight_hours_sleep_count,
        SUM(CASE WHEN wake_by_730am THEN 1 ELSE 0 END) as wake_by_730am_count,
        SUM(CASE WHEN workout THEN 1 ELSE 0 END) as workout_count,
        SUM(CASE WHEN ten_k_steps THEN 1 ELSE 0 END) as ten_k_steps_count,
        SUM(CASE WHEN play_with_ai THEN 1 ELSE 0 END) as play_with_ai_count,
        SUM(CASE WHEN read_investing THEN 1 ELSE 0 END) as read_investing_count,
        SUM(CASE WHEN read_finance THEN 1 ELSE 0 END) as read_finance_count,
        SUM(CASE WHEN read_crypto THEN 1 ELSE 0 END) as read_crypto_count,
        SUM(CASE WHEN posted_twitter THEN 1 ELSE 0 END) as posted_twitter_count,
        SUM(CASE WHEN posted_linkedin THEN 1 ELSE 0 END) as posted_linkedin_count,
        SUM(CASE WHEN reading_books THEN 1 ELSE 0 END) as reading_books_count,
        SUM(CASE WHEN person_reached_out IS NOT NULL AND person_reached_out != '' THEN 1 ELSE 0 END) as person_reached_out_count,
        SUM(CASE WHEN (play_with_ai AND read_investing AND read_finance AND read_crypto) THEN 1 ELSE 0 END) as four_daily_complete_count
       FROM daily_entries
       WHERE entry_date >= $1`,
      [startDate]
    );

    const stats = result.rows[0];
    const totalDays = parseInt(stats.total_days) || 1; // Avoid division by zero

    // Calculate completion percentages
    const overview = {
      period_days: days,
      total_entries: totalDays,
      sleep_goals: {
        bed_before_11pm: {
          count: parseInt(stats.bed_before_11pm_count),
          percentage: Math.round((stats.bed_before_11pm_count / totalDays) * 100)
        },
        eight_hours_sleep: {
          count: parseInt(stats.eight_hours_sleep_count),
          percentage: Math.round((stats.eight_hours_sleep_count / totalDays) * 100)
        },
        wake_by_730am: {
          count: parseInt(stats.wake_by_730am_count),
          percentage: Math.round((stats.wake_by_730am_count / totalDays) * 100)
        }
      },
      activities: {
        workout: {
          count: parseInt(stats.workout_count),
          percentage: Math.round((stats.workout_count / totalDays) * 100)
        },
        ten_k_steps: {
          count: parseInt(stats.ten_k_steps_count),
          percentage: Math.round((stats.ten_k_steps_count / totalDays) * 100)
        },
        play_with_ai: {
          count: parseInt(stats.play_with_ai_count),
          percentage: Math.round((stats.play_with_ai_count / totalDays) * 100)
        },
        read_investing: {
          count: parseInt(stats.read_investing_count),
          percentage: Math.round((stats.read_investing_count / totalDays) * 100)
        },
        read_finance: {
          count: parseInt(stats.read_finance_count),
          percentage: Math.round((stats.read_finance_count / totalDays) * 100)
        },
        read_crypto: {
          count: parseInt(stats.read_crypto_count),
          percentage: Math.round((stats.read_crypto_count / totalDays) * 100)
        },
        posted_twitter: {
          count: parseInt(stats.posted_twitter_count),
          percentage: Math.round((stats.posted_twitter_count / totalDays) * 100)
        },
        posted_linkedin: {
          count: parseInt(stats.posted_linkedin_count),
          percentage: Math.round((stats.posted_linkedin_count / totalDays) * 100)
        },
        reading_books: {
          count: parseInt(stats.reading_books_count),
          percentage: Math.round((stats.reading_books_count / totalDays) * 100)
        },
        person_reached_out: {
          count: parseInt(stats.person_reached_out_count),
          percentage: Math.round((stats.person_reached_out_count / totalDays) * 100)
        }
      },
      four_daily_complete: {
        count: parseInt(stats.four_daily_complete_count),
        percentage: Math.round((stats.four_daily_complete_count / totalDays) * 100)
      }
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/analytics/streaks
 * Calculate current streaks for each goal
 */
router.get('/streaks', async (req, res) => {
  try {
    // Get all entries ordered by date descending
    const result = await pool.query(
      `SELECT * FROM daily_entries ORDER BY entry_date DESC`
    );

    const entries = result.rows;

    // Calculate current streak for each activity
    const calculateStreak = (field) => {
      let streak = 0;
      for (const entry of entries) {
        if (entry[field]) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };

    const streaks = {
      bed_before_11pm: calculateStreak('bed_before_11pm'),
      eight_hours_sleep: calculateStreak('eight_hours_sleep'),
      wake_by_730am: calculateStreak('wake_by_730am'),
      workout: calculateStreak('workout'),
      ten_k_steps: calculateStreak('ten_k_steps'),
      play_with_ai: calculateStreak('play_with_ai'),
      read_investing: calculateStreak('read_investing'),
      read_finance: calculateStreak('read_finance'),
      read_crypto: calculateStreak('read_crypto'),
      posted_twitter: calculateStreak('posted_twitter'),
      posted_linkedin: calculateStreak('posted_linkedin'),
      reading_books: calculateStreak('reading_books')
    };

    // Calculate "perfect day" streak (all goals completed)
    let perfectDayStreak = 0;
    for (const entry of entries) {
      const allComplete = entry.bed_before_11pm && entry.eight_hours_sleep &&
                          entry.wake_by_730am && entry.workout && entry.ten_k_steps &&
                          entry.play_with_ai && entry.read_investing &&
                          entry.read_finance && entry.read_crypto &&
                          entry.posted_twitter && entry.posted_linkedin &&
                          entry.reading_books &&
                          (entry.person_reached_out && entry.person_reached_out.trim() !== '');
      if (allComplete) {
        perfectDayStreak++;
      } else {
        break;
      }
    }

    streaks.perfect_day = perfectDayStreak;

    res.json(streaks);
  } catch (error) {
    console.error('Error calculating streaks:', error);
    res.status(500).json({ error: 'Failed to calculate streaks' });
  }
});

/**
 * GET /api/analytics/heatmap?year=2026
 * Get data for heat map visualization (like GitHub contributions)
 */
router.get('/heatmap', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const result = await pool.query(
      `SELECT
        entry_date,
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
         CASE WHEN person_reached_out IS NOT NULL AND person_reached_out != '' THEN 1 ELSE 0 END) as activities_completed
       FROM daily_entries
       WHERE EXTRACT(YEAR FROM entry_date) = $1
       ORDER BY entry_date`,
      [year]
    );

    const heatmapData = result.rows.map(row => ({
      date: row.entry_date,
      count: parseInt(row.activities_completed),
      level: Math.min(Math.floor(row.activities_completed / 3), 4) // 0-4 levels for color intensity
    }));

    res.json(heatmapData);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

export default router;
