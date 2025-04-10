import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { env } from './config/env';
import { handleStart } from './bot/handlers/start';
import { handlePoints } from './bot/handlers/points';
import { handleDaily } from './bot/handlers/daily';
import { handleLeaderboard } from './bot/handlers/leaderboard';
import { handleInvite } from './bot/handlers/invite';
import { handleReferrals } from './bot/handlers/referrals';
import { handleGroupMessage } from './bot/handlers/groupActivity';
import { verifyGroupMembership } from './bot/middleware/groupVerification';
import axios from 'axios';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Vérification des variables d'environnement
console.log('🔍 Environment variables loaded successfully');

// Vérification du token
const token = env.BOT_TOKEN;
console.log('🔑 Token check:', {
  length: token.length,
  startsWithBot: token.startsWith('bot'),
  containsColon: token.includes(':'),
  format: token.substring(0, 10) + '...'
});

// Nettoyer le token en supprimant le préfixe "bot" s'il est déjà présent
const cleanToken = token.startsWith('bot') ? token.substring(3) : token;
console.log('🧹 Cleaned token format:', cleanToken.substring(0, 10) + '...');

// Créer une instance Telegraf avec le token nettoyé
const bot = new Telegraf(cleanToken, {
  handlerTimeout: 90000 // 90 secondes
});

// Register message handler for group activity
bot.on('message', async (ctx, next) => {
  console.log('📨 Received message:', {
    chatId: ctx.chat?.id,
    chatType: ctx.chat?.type,
    username: 'username' in ctx.chat ? ctx.chat.username : 'N/A',
    text: ctx.message && 'text' in ctx.message ? ctx.message.text : 'N/A'
  });

  if (ctx.chat?.type === 'supergroup' && 'username' in ctx.chat && ctx.chat.username === 'buildr_network') {
    await handleGroupMessage(ctx);
  }
  return next();
});

// Register command handlers with group verification
bot.command('start', async (ctx) => {
  console.log('🚀 Start command received from:', ctx.from?.username);
  try {
    await handleStart(ctx);
    console.log('✅ Start command handled successfully');
  } catch (error) {
    console.error('❌ Error handling start command:', error);
    throw error;
  }
});

bot.command('points', verifyGroupMembership, handlePoints);
bot.command('daily', verifyGroupMembership, handleDaily);
bot.command('leaderboard', verifyGroupMembership, handleLeaderboard);
bot.command('invite', verifyGroupMembership, handleInvite);
bot.command('referrals', verifyGroupMembership, handleReferrals);

// Register callback handlers for inline buttons
bot.action('check_balance', verifyGroupMembership, handlePoints);
bot.action('daily_reward', verifyGroupMembership, handleDaily);
bot.action('get_invite', verifyGroupMembership, handleInvite);
bot.action('my_referrals', verifyGroupMembership, handleReferrals);
bot.action('view_leaderboard', verifyGroupMembership, handleLeaderboard);

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

// Vérifier le token avant de démarrer le bot
async function verifyToken() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${cleanToken}/getMe`);
    console.log('✅ Token verification successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return false;
  }
}

// Fonction pour configurer le webhook
async function setupWebhook() {
  try {
    const webhookUrl = env.WEBHOOK_URL;
    console.log('🌐 Setting up webhook to:', webhookUrl);
    
    // Vérifier que l'URL est valide
    if (!webhookUrl || !webhookUrl.startsWith('https://')) {
      console.error('❌ Invalid webhook URL:', webhookUrl);
      return false;
    }
    
    // Configurer le webhook avec Telegram
    const response = await axios.post(`https://api.telegram.org/bot${cleanToken}/setWebhook`, {
      url: webhookUrl,
      drop_pending_updates: true,
      allowed_updates: ["message", "callback_query", "chat_member"]
    });
    
    console.log('✅ Webhook setup response:', response.data);
    return response.data.ok === true;
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    return false;
  }
}

// Fonction pour supprimer le webhook
async function removeWebhook() {
  try {
    console.log('🗑️ Removing webhook');
    const response = await axios.post(`https://api.telegram.org/bot${cleanToken}/setWebhook`, {
      url: ""
    });
    
    console.log('✅ Webhook removal response:', response.data);
    return response.data.ok === true;
  } catch (error) {
    console.error('❌ Error removing webhook:', error);
    return false;
  }
}

// Fonction pour obtenir les informations du webhook
async function getWebhookInfo() {
  try {
    console.log('ℹ️ Getting webhook info');
    const response = await axios.get(`https://api.telegram.org/bot${cleanToken}/getWebhookInfo`);
    
    console.log('✅ Webhook info:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting webhook info:', error);
    return null;
  }
}

// Fonction pour démarrer le bot en mode polling (développement)
async function startPolling() {
  console.log('🔧 Starting bot in polling mode...');
  try {
    await verifyToken();
    await bot.launch();
    console.log('✅ Bot started successfully in polling mode');
  } catch (error) {
    console.error('❌ Error starting bot in polling mode:', error);
  }
}

// Fonction pour gérer les requêtes webhook (production)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('📥 Received webhook request:', {
    method: req.method,
    path: req.url,
    headers: req.headers,
    body: req.body
  });
  
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    console.log('❌ Invalid HTTP method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Traiter la mise à jour Telegram
    await bot.handleUpdate(req.body);
    console.log('✅ Update handled successfully');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Error handling update:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Démarrer le bot en fonction de l'environnement
if (process.env.NODE_ENV === 'development') {
  // En développement, utiliser le mode polling
  startPolling();
  
  // Activer l'arrêt gracieux
  process.once('SIGINT', () => {
    console.log('🛑 Received SIGINT, stopping bot...');
    bot.stop('SIGINT');
  });
  
  process.once('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, stopping bot...');
    bot.stop('SIGTERM');
  });
} else {
  // En production, configurer le webhook
  console.log('🚀 Starting bot in webhook mode...');
  
  // Vérifier le token et configurer le webhook au démarrage
  verifyToken()
    .then(isValid => {
      if (isValid) {
        return setupWebhook();
      }
      throw new Error('Invalid bot token');
    })
    .then(success => {
      if (success) {
        console.log('✅ Webhook configured successfully');
        return getWebhookInfo();
      }
      throw new Error('Failed to configure webhook');
    })
    .then(info => {
      console.log('ℹ️ Webhook info:', info);
    })
    .catch(error => {
      console.error('❌ Error in production setup:', error);
    });
} 