# Deployment Guide for Daily Tracker 2026

## Prerequisites

Before deploying, you'll need accounts for:

1. **GitHub** (free) - For hosting code
2. **Railway** or **Render** (free tier available) - For hosting
3. **Twilio** (free trial, then pay-as-you-go) - For WhatsApp notifications

## Step 1: Set up Twilio for WhatsApp

1. Go to [twilio.com](https://www.twilio.com) and create an account
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Follow the setup wizard:
   - Activate your Twilio Sandbox for WhatsApp
   - You'll get a phone number like `+14155238886`
   - Send the join code from your WhatsApp to activate
4. Get your credentials:
   - Account SID (found on console dashboard)
   - Auth Token (found on console dashboard)
   - WhatsApp number (the +1415... number)
   - Your phone number (your WhatsApp number with country code)

**Note:** The sandbox is free but has limitations. For production, you'll need to apply for WhatsApp Business API approval.

## Step 2: Set up PostgreSQL Database

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project**
4. Select **Provision PostgreSQL**
5. Click on the PostgreSQL service
6. Go to **Variables** tab
7. Copy the `DATABASE_URL` value

### Option B: Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New** → **PostgreSQL**
4. Fill in:
   - Name: daily-tracker-db
   - Region: Choose closest to you
   - Plan: Free
5. Click **Create Database**
6. Copy the **External Database URL**

## Step 3: Deploy to Railway

1. Push your code to GitHub:
```bash
cd daily-tracker-2026
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [railway.app](https://railway.app)
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `daily-tracker-2026` repository
5. Railway will auto-detect it as a Node.js app

6. Add environment variables:
   - Click on your service
   - Go to **Variables** tab
   - Add the following:

```
DATABASE_URL=your_postgres_connection_string
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TO=whatsapp:+1YOUR_PHONE_NUMBER
PORT=3000
NODE_ENV=production
BASE_URL=https://your-app-url.railway.app
TZ=America/New_York
```

7. Update the `TZ` variable to your timezone:
   - US Pacific: `America/Los_Angeles`
   - US Mountain: `America/Denver`
   - US Central: `America/Chicago`
   - US Eastern: `America/New_York`
   - [Full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

8. Deploy:
   - Railway will automatically deploy
   - Click **Deployments** to see progress
   - Once deployed, click **Settings** → **Generate Domain**

9. Run database migration:
   - Go to your Railway project
   - Click on the service
   - Go to **Settings** → scroll to **Deploy Command**
   - Add: `node server/migrate.js && node server/index.js`
   - Redeploy

## Step 4: Deploy to Render (Alternative)

1. Push code to GitHub (same as Step 3.1 above)

2. Go to [render.com](https://render.com)
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Fill in the details:
   - Name: daily-tracker-2026
   - Environment: Node
   - Build Command: `npm install && cd client && npm install && npm run build`
   - Start Command: `node server/migrate.js && node server/index.js`

6. Add environment variables (same as Railway in Step 3.6)

7. Click **Create Web Service**

8. Once deployed, your app will be at `https://daily-tracker-2026.onrender.com`

## Step 5: Build and Serve Frontend

For production, you'll want to serve the React app from the Express server.

Update `server/index.js` to serve the built React app:

```javascript
// Add this after your API routes
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

Update your deploy command:
```bash
npm install && cd client && npm install && npm run build && cd .. && node server/migrate.js && node server/index.js
```

## Step 6: Test Your Deployment

1. Visit your deployed URL
2. You should see the Daily Tracker app
3. Click "Track Today" and fill out the form
4. Submit and check that it saves
5. Go to Dashboard and verify your data appears

## Step 7: Test WhatsApp Notifications

The app is configured to send WhatsApp messages at 10 PM daily. To test immediately:

1. SSH into your Railway/Render instance or use their console
2. Run the following Node.js code:

```javascript
// In Railway console
import { sendDailyReminder } from './server/services/whatsapp.js';
await sendDailyReminder();
```

Or manually test Twilio:
- Go to Twilio Console
- Navigate to Messaging → Try it out → Send a WhatsApp message
- Send a test message to your number

## Troubleshooting

### WhatsApp not receiving messages
- Make sure you've joined the Twilio sandbox (send the join code)
- Check your WHATSAPP_TO format: `whatsapp:+1XXXXXXXXXX` (no spaces, dashes)
- Verify Twilio credentials are correct
- Check Twilio logs in the dashboard

### Database connection errors
- Verify DATABASE_URL is correct
- Make sure SSL is enabled for production databases
- Check that the migration ran successfully

### App not loading
- Check deployment logs
- Verify all environment variables are set
- Make sure build command completed successfully

### Cron job not running
- Check server logs to see if the scheduler initialized
- Verify TZ environment variable is set
- Test timezone: `console.log(new Date().toLocaleString())`

## Costs

**Free tier limits:**
- Railway: $5 free credit/month (should be enough for this app)
- Render: 750 hours/month free (enough for one always-on service)
- Twilio: Free trial credit, then ~$0.005 per WhatsApp message

**Estimated monthly cost (after free tiers):**
- Hosting: $0-5
- WhatsApp messages: ~$0.15 (30 messages/month)
- Total: ~$5/month

## Next Steps

1. Set up a custom domain (optional)
2. Configure WhatsApp Business API for production (removes "Twilio Sandbox" from messages)
3. Add authentication if you want to share the app with others
4. Set up monitoring and error tracking (Sentry, LogRocket, etc.)
5. Add data export functionality
6. Set up automated backups for your database

## Support

If you run into issues:
1. Check the logs in Railway/Render dashboard
2. Verify all environment variables are set correctly
3. Test each component individually (database, API, WhatsApp)
4. Check Twilio and Railway/Render status pages for outages
