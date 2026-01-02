# Setup Checklist for Daily Tracker 2026

Use this checklist to ensure everything is configured correctly.

## Local Development Setup

### ✅ Initial Setup
- [ ] Node.js 18+ installed
- [ ] Cloned/downloaded the project
- [ ] Ran `npm install` in root directory
- [ ] Ran `cd client && npm install`

### ✅ Database Setup
- [ ] Created PostgreSQL database (Railway/Render/local)
- [ ] Copied `.env.example` to `.env`
- [ ] Added `DATABASE_URL` to `.env`
- [ ] Ran `npm run migrate` successfully
- [ ] Verified tables created in database

### ✅ Environment Variables (Minimum for Local)
- [ ] `DATABASE_URL` - Your PostgreSQL connection string
- [ ] `PORT` - Set to 3000
- [ ] `NODE_ENV` - Set to development
- [ ] `BASE_URL` - Set to http://localhost:3000
- [ ] `TZ` - Set to your timezone

### ✅ Test Local Setup
- [ ] Started backend: `npm run dev`
- [ ] Backend running at http://localhost:3000
- [ ] Started frontend: `npm run client` (or `npm run dev:all`)
- [ ] Frontend running at http://localhost:5173
- [ ] Can access the app in browser
- [ ] Can submit a tracking form
- [ ] Can view dashboard with data

---

## WhatsApp Setup (Optional but Recommended)

### ✅ Twilio Account
- [ ] Created account at [twilio.com](https://www.twilio.com)
- [ ] Verified email
- [ ] Got free trial credits

### ✅ WhatsApp Sandbox Setup
- [ ] Navigated to Messaging → Try WhatsApp
- [ ] Sent join code from your WhatsApp
- [ ] Received confirmation from Twilio
- [ ] Noted the Twilio WhatsApp number (e.g., +14155238886)

### ✅ Get Credentials
- [ ] Copied Account SID from dashboard
- [ ] Copied Auth Token from dashboard
- [ ] Formatted your number as `whatsapp:+1XXXXXXXXXX`

### ✅ Update .env
- [ ] Added `TWILIO_ACCOUNT_SID`
- [ ] Added `TWILIO_AUTH_TOKEN`
- [ ] Added `TWILIO_WHATSAPP_FROM`
- [ ] Added `WHATSAPP_TO` (your number)

### ✅ Test WhatsApp
- [ ] Restarted server
- [ ] Tested manual message send (optional)
- [ ] Verified 10 PM reminder is scheduled (check server logs)

---

## Production Deployment

### ✅ Code Preparation
- [ ] Pushed code to GitHub
- [ ] `.env` is in `.gitignore` (don't commit secrets!)
- [ ] `README.md` updated with project info

### ✅ Hosting Platform (Railway or Render)

#### Railway
- [ ] Created account
- [ ] Connected GitHub repository
- [ ] Project auto-deployed
- [ ] Added all environment variables
- [ ] Updated `NODE_ENV` to `production`
- [ ] Updated `BASE_URL` to your Railway URL
- [ ] Set deploy command: `npm run build && npm run deploy`
- [ ] Generated domain name
- [ ] Database migration ran successfully

#### Render
- [ ] Created account
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Set build command: `npm install && cd client && npm install && npm run build`
- [ ] Set start command: `node server/migrate.js && node server/index.js`
- [ ] Added all environment variables
- [ ] Updated `NODE_ENV` to `production`
- [ ] Updated `BASE_URL` to your Render URL
- [ ] Deployed successfully

### ✅ Production Database
- [ ] PostgreSQL database created
- [ ] SSL enabled (auto for Railway/Render)
- [ ] `DATABASE_URL` added to environment variables
- [ ] Migration ran successfully
- [ ] Can connect to database

### ✅ Production Testing
- [ ] App loads at deployed URL
- [ ] Can submit tracking data
- [ ] Dashboard shows data correctly
- [ ] All charts render properly
- [ ] Heat map displays
- [ ] No console errors

### ✅ WhatsApp in Production
- [ ] `WHATSAPP_TO` uses correct number format
- [ ] `BASE_URL` points to production URL
- [ ] Twilio credentials are correct
- [ ] Cron job is running (check logs)
- [ ] Received test notification at 10 PM

---

## Verification Tests

### ✅ Data Persistence
- [ ] Submit data and refresh page - data persists
- [ ] Submit multiple days of data
- [ ] Change time range on dashboard - data updates
- [ ] Heat map shows historical data

### ✅ Analytics Working
- [ ] Streaks calculate correctly
- [ ] Completion percentages accurate
- [ ] Charts display properly
- [ ] Time range selector works (7/30/90/365 days)

### ✅ Mobile Experience
- [ ] App works on mobile browser
- [ ] Touch interactions work
- [ ] Navigation is mobile-friendly
- [ ] Forms are easy to fill on mobile
- [ ] WhatsApp link opens tracking page on mobile

---

## Common Issues Checklist

### Database Connection Failed
- [ ] `DATABASE_URL` format is correct
- [ ] Database service is running
- [ ] SSL settings match (production should have SSL)
- [ ] Firewall allows connection

### WhatsApp Not Sending
- [ ] Joined Twilio sandbox
- [ ] Phone number format: `whatsapp:+1XXXXXXXXXX`
- [ ] No spaces or dashes in phone number
- [ ] Account SID and Auth Token are correct
- [ ] Server is running at scheduled time

### Charts Not Displaying
- [ ] Browser supports modern JavaScript
- [ ] No console errors
- [ ] At least one day of data exists
- [ ] Chart.js dependencies installed

### Can't Access After Deployment
- [ ] Domain/URL is correct
- [ ] Build completed successfully
- [ ] Environment variables set in hosting platform
- [ ] Logs show no errors

---

## Security Checklist

### ✅ Environment Security
- [ ] `.env` file is NOT committed to git
- [ ] `.gitignore` includes `.env`
- [ ] Secrets are only in environment variables
- [ ] Production uses different credentials than development

### ✅ Database Security
- [ ] Database has strong password
- [ ] SSL enabled for database connections
- [ ] Database not publicly accessible (only from app)
- [ ] Regular backups enabled

### ✅ API Security
- [ ] CORS configured properly
- [ ] No sensitive data in API responses
- [ ] Input validation on forms
- [ ] SQL injection protection (using parameterized queries)

---

## Optional Enhancements Checklist

### ✅ Advanced Features
- [ ] Set up custom domain
- [ ] Add authentication for multi-user
- [ ] Configure monitoring/alerts
- [ ] Set up error tracking (Sentry)
- [ ] Add data export functionality

### ✅ Customization
- [ ] Changed goals to match personal needs
- [ ] Updated branding/colors
- [ ] Modified reminder time
- [ ] Customized WhatsApp messages

---

## Final Check ✅

- [ ] Everything works locally
- [ ] Everything works in production
- [ ] WhatsApp reminders working
- [ ] Database backups configured
- [ ] Documentation updated
- [ ] Ready to start tracking!

---

**Congratulations!** 🎉 Your Daily Tracker 2026 is ready to help you crush your goals!

Start tracking today and build those streaks! 💪
