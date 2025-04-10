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
console.log('🔍 Environment variables loaded successfully');

console.log('🚀 Starting bot initialization...');

// Vérification du token du bot
if (!env.BOT_TOKEN.match(/^bot\d+:[A-Za-z0-9_-]{35}$/)) {
  console.error('❌ Invalid bot token format. Expected format: bot<bot_id>:<token>');
  process.exit(1);
}

console.log('✅ Bot token format is valid');

// Créer une instance Telegraf avec une configuration personnalisée
const bot = new Telegraf(env.BOT_TOKEN, {
  telegram: {
    apiRoot: 'https://api.telegram.org',
    webhookReply: false
  }
});

// Test de connexion à l'API Telegram
console.log('🔌 Testing connection to Telegram API...');
console.log('🔑 Using bot token:', env.BOT_TOKEN.substring(0, 10) + '...');

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
  if (ctx.chat?.type === 'supergroup' && ctx.chat.username === 'buildr_network') {
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
  console.log('📥 Received request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });

  if (req.method === 'POST') {
    try {
      // Validate the request body
      if (!req.body) {
        console.error('❌ No request body received');
        return res.status(400).json({ error: 'No request body' });
      }

      // Log the incoming update for debugging
      console.log('📦 Processing update:', JSON.stringify(req.body, null, 2));
      
      // Utiliser Telegraf pour traiter l'update
      await bot.handleUpdate(req.body);
      console.log('✅ Update processed successfully');
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('❌ Error handling update:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      return res.status(500).json({ 
        error: 'Failed to process update',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    console.log('ℹ️ Received non-POST request');
    return res.status(200).json({ ok: true, message: 'Bot is running' });
  }
}

// Start webhook mode if not in development
if (process.env.NODE_ENV !== 'development') {
  const webhookUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/webhook`
    : process.env.WEBHOOK_URL;

  if (webhookUrl) {
    console.log('🔄 Setting up webhook...');
    console.log('📍 Webhook URL:', webhookUrl);
    
    // Delete any existing webhook first
    bot.telegram.deleteWebhook()
      .then(() => {
        console.log('✅ Existing webhook deleted');
        // Set the new webhook
        return bot.telegram.setWebhook(webhookUrl);
      })
      .then(() => {
        console.log('✅ Webhook successfully set to:', webhookUrl);
        // Verify webhook info
        return bot.telegram.getWebhookInfo();
      })
      .then((info) => {
        console.log('ℹ️ Webhook info:', info);
      })
      .catch((error) => {
        console.error('❌ Error setting webhook:', error);
      });
  } else {
    console.error('❌ No webhook URL available. Please check VERCEL_URL and WEBHOOK_URL environment variables.');
  }
} else {
  console.log('🔧 Development mode detected, skipping webhook setup');
} 