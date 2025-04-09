import { Telegraf } from 'telegraf';
import { env } from '../src/config/env';
import { handleStart } from '../src/bot/handlers/start';
import { handlePoints } from '../src/bot/handlers/points';
import { handleDaily } from '../src/bot/handlers/daily';
import { handleLeaderboard } from '../src/bot/handlers/leaderboard';

const bot = new Telegraf(env.BOT_TOKEN);

// Register command handlers
bot.command('start', (ctx) => {
  console.log('📥 Received /start command from user:', ctx.from?.id, 'username:', ctx.from?.username);
  return handleStart(ctx);
});

bot.command('points', (ctx) => {
  console.log('📥 Received /points command from user:', ctx.from?.id, 'username:', ctx.from?.username);
  return handlePoints(ctx);
});

bot.command('daily', (ctx) => {
  console.log('📥 Received /daily command from user:', ctx.from?.id, 'username:', ctx.from?.username);
  return handleDaily(ctx);
});

bot.command('leaderboard', (ctx) => {
  console.log('📥 Received /leaderboard command from user:', ctx.from?.id, 'username:', ctx.from?.username);
  return handleLeaderboard(ctx);
});

// Error handling
bot.catch((err: unknown, ctx) => {
  console.error('❌ Bot error:', err);
  if (err instanceof Error) {
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
  }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error handling update:', error);
      res.status(500).json({ error: 'Failed to process update' });
    }
  } else {
    res.status(200).json({ ok: true, message: 'Bot is running' });
  }
} 