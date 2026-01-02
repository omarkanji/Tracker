# Quick Start Guide

Get your Daily Tracker 2026 running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([download here](https://nodejs.org/))
- PostgreSQL database (you can use a free one from Railway or Render)

## Step 1: Install Dependencies

```bash
cd daily-tracker-2026

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Set up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your values:
   - Get a PostgreSQL database URL from [Railway](https://railway.app) or [Render](https://render.com)
   - For now, you can skip Twilio setup (WhatsApp won't work but everything else will)

Minimum required for local testing:
```env
DATABASE_URL=your_postgres_url_here
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
TZ=America/New_York
```

## Step 3: Set up the Database

Run the migration to create your database tables:

```bash
npm run migrate
```

You should see: "✅ Database migrations completed successfully!"

## Step 4: Start the Application

### Option A: Run Backend and Frontend Separately

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run client
```

### Option B: Run Both Together

```bash
npm run dev:all
```

## Step 5: Access the App

Open your browser and go to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## Using the App

1. **Track Today**: Click "Track Today" in the navigation
2. **Check boxes**: Mark which goals you've completed today
3. **Save**: Click "Save Today's Progress"
4. **View Dashboard**: Click "Dashboard" to see your stats, streaks, and charts!

## Optional: Set up WhatsApp Notifications

To receive daily 10 PM reminders:

1. Create a [Twilio account](https://www.twilio.com)
2. Set up WhatsApp Sandbox (it's free for testing)
3. Add these to your `.env`:
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TO=whatsapp:+1YOURNUMBER
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Twilio setup instructions.

## Troubleshooting

### "Cannot connect to database"
- Make sure your DATABASE_URL is correct
- Check that your database service is running
- Verify you ran `npm run migrate`

### "Port 3000 already in use"
- Change PORT in `.env` to another number (like 3001)
- Or stop whatever is using port 3000

### Frontend won't load
- Make sure you ran `npm install` in the `client` directory
- Check that port 5173 is available
- Try `cd client && npm run dev`

### Charts not showing
- Make sure you have at least one day of data
- Try refreshing the page
- Check browser console for errors

## What's Tracked?

### Sleep Goals (3 items)
- Bed before 11 PM
- 8 hours in bed
- Wake by 7:30 AM

### Daily Activities (8 items)
- Workout
- Play with AI
- Read about investing
- Read about finance
- Read about crypto
- Post on Twitter
- Post on LinkedIn
- Reading/books

## Next Steps

1. **Start tracking!** Fill out your first day's data
2. **Build a streak** Try to complete your goals multiple days in a row
3. **Deploy it** See [DEPLOYMENT.md](DEPLOYMENT.md) to deploy online
4. **Customize it** Edit the code to track your own goals!

## Need Help?

Check out:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [README.md](README.md) - Project overview and tech stack

---

Happy tracking! 🚀
