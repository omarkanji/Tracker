import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendDailyReminder } from './services/whatsapp.js';
import trackingRoutes from './routes/tracking.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Catch-all route to serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Schedule daily reminder at 10 PM
// Cron format: minute hour day month dayOfWeek
// 0 22 * * * = Every day at 10:00 PM
cron.schedule('0 22 * * *', async () => {
  console.log('Sending daily reminder at 10 PM...');
  try {
    await sendDailyReminder();
    console.log('Daily reminder sent successfully');
  } catch (error) {
    console.error('Failed to send daily reminder:', error);
  }
}, {
  timezone: process.env.TZ || 'America/New_York'
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Daily reminders scheduled for 10 PM ${process.env.TZ || 'America/New_York'}`);
});
