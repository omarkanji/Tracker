# Daily Tracker 2026

A comprehensive daily habit tracker with WhatsApp notifications and beautiful visualizations.

## Features

- 🔔 Daily WhatsApp reminders at 10 PM
- 📊 Interactive dashboard with streaks, heat maps, and charts
- ☁️ Cloud-based with automatic backups
- 📱 Mobile-friendly tracking interface

## What I Track

### Sleep Goals
- Bed before 11 PM
- 8 hours in bed
- Wake up by 7:30 AM

### Daily Activities
- Workout
- Play with AI
- Read about investing
- Read about finance
- Read about crypto
- Tweet (Twitter post)
- LinkedIn post
- Reading/books

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Railway or Render)
- Twilio account for WhatsApp

### Installation

1. Clone and install dependencies:
```bash
npm install
cd client && npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start development servers:
```bash
npm run dev:all
```

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Frontend**: React, Chart.js
- **Notifications**: Twilio WhatsApp API
- **Hosting**: Railway/Render
