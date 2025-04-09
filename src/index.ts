import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { env } from './config/env';
import { handleStart } from './bot/handlers/start';
import { handlePoints } from './bot/handlers/points';
import { handleDaily } from './bot/handlers/daily';
import { handleLeaderboard } from './bot/handlers/leaderboard';

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

// Start the bot
const startBot = async () => {
  try {
    console.log('⚙️ Initializing bot...');
    await bot.launch();
    console.log('✅ Bot successfully started!');
    console.log('🤖 Bot username:', bot.botInfo?.username);
    console.log('📊 Bot info:', {
      id: bot.botInfo?.id,
      firstName: bot.botInfo?.first_name,
      canJoinGroups: bot.botInfo?.can_join_groups,
      canReadAllGroupMessages: bot.botInfo?.can_read_all_group_messages
    });
  } catch (err) {
    console.error('❌ Failed to start bot:', err);
    if (err instanceof Error) {
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
    }
    process.exit(1);
  }
};

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('🛑 Received SIGINT signal, stopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('🛑 Received SIGTERM signal, stopping bot...');
  bot.stop('SIGTERM');
});

// Start the bot
startBot();

// Export for Vercel
export default bot; 