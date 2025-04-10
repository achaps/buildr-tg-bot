import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { env } from './config/env';
import { handleStart } from './bot/handlers/start';
import { handlePoints } from './bot/handlers/points';
import { handleDaily } from './bot/handlers/daily';
import { handleLeaderboard } from './bot/handlers/leaderboard';
import { handleGroupMessage } from './bot/handlers/groupActivity';
import { verifyGroupMembership } from './bot/middleware/groupVerification';
import { Request, Response } from 'express';

// Vérification des variables d'environnement
console.log('🔍 Checking environment variables...');
try {
  console.log('SUPABASE_URL:', env.SUPABASE_URL);
  console.log('BOT_TOKEN length:', env.BOT_TOKEN.length);
  console.log('SUPABASE_ANON_KEY length:', env.SUPABASE_ANON_KEY.length);
} catch (error) {
  console.error('❌ Error loading environment variables:', error);
  process.exit(1);
}

console.log('🚀 Starting bot initialization...');

// Vérification du token du bot
if (!env.BOT_TOKEN.match(/^\d+:[A-Za-z0-9_-]{35}$/)) {
  console.error('❌ Invalid bot token format. Expected format: <bot_id>:<token>');
  process.exit(1);
}

console.log('✅ Bot token format is valid');

const bot = new Telegraf(env.BOT_TOKEN);

// Test de connexion à l'API Telegram
console.log('🔌 Testing connection to Telegram API...');
bot.telegram.getMe()
  .then((botInfo) => {
    console.log('✅ Successfully connected to Telegram API');
    console.log('Bot info:', botInfo);
  })
  .catch((error) => {
    console.error('❌ Failed to connect to Telegram API:', error);
    process.exit(1);
  });

// Register message handler for group activity
bot.on('message', async (ctx, next) => {
  if (ctx.chat?.id.toString() === '@buildr_network') {
    await handleGroupMessage(ctx);
  }
  return next();
});

// Register command handlers with group verification
bot.command('start', handleStart);
bot.command('points', verifyGroupMembership, handlePoints);
bot.command('daily', verifyGroupMembership, handleDaily);
bot.command('leaderboard', verifyGroupMembership, handleLeaderboard);

// Error handling
bot.catch((err: unknown, ctx: Context<Update>) => {
  console.error('❌ Bot error:', err);
  if (err instanceof Error) {
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
  }
  
  if (ctx) {
    console.error('Error context:', {
      chatId: ctx.chat?.id,
      userId: ctx.from?.id,
      username: ctx.from?.username,
      messageText: ctx.message && 'text' in ctx.message ? ctx.message.text : 'N/A',
      messageType: ctx.message ? Object.keys(ctx.message)[0] : 'N/A'
    });
  }
});

// Export for Vercel
export default async function handler(req: Request, res: Response) {
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

// Start webhook mode if not in development
if (process.env.NODE_ENV !== 'development') {
  const webhookUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/webhook`
    : process.env.WEBHOOK_URL;

  if (webhookUrl) {
    bot.telegram.setWebhook(webhookUrl);
    console.log('Webhook set to:', webhookUrl);
  }
} 