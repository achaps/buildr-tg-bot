# Buildr Telegram Bot

A Telegram bot that manages user points, referrals, daily check-ins, and leaderboards using Telegraf, Supabase, and TypeScript.

## Features

- `/start` - Register new users (10 pBUILDR) with referral support (+25 to referrer)
- `/points` - Check your current point balance
- `/daily` - Daily check-in with streak-based rewards
- `/leaderboard` - View top 10 users by points

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Supabase account and project

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd buildr-telegram-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   BOT_TOKEN=your_telegram_bot_token
   ```

4. Set up Supabase tables:

   Create the following tables in your Supabase project:

   ```sql
   -- Users table
   create table users (
     telegram_id text primary key,
     username text,
     total_points integer default 0,
     referred_by text,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Daily check-ins table
   create table daily_checkins (
     telegram_id text primary key references users(telegram_id),
     last_checkin timestamp with time zone,
     streak integer default 0
   );
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## Development

- Run in development mode with hot reload:
  ```bash
  npm run dev
  ```

- Build the project:
  ```bash
  npm run build
  ```

## Project Structure

```
src/
├── bot/
│   └── handlers/
│       ├── start.ts
│       ├── points.ts
│       ├── daily.ts
│       └── leaderboard.ts
├── config/
│   └── env.ts
├── services/
│   └── supabaseClient.ts
├── types/
│   ├── user.ts
│   └── checkin.ts
├── utils/
│   └── points.ts
└── index.ts
```

## Points System

- Initial points: 10 pBUILDR
- Referral bonus: 25 pBUILDR
- Daily check-in: 5 + (streak - 1) pBUILDR (capped at 10)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. # buildr-tg-bot
