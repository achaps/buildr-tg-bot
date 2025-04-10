import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

if (!VERCEL_URL) {
  console.error('❌ VERCEL_URL is not set in environment variables');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const webhookUrl = `https://${VERCEL_URL}/api/webhook`;

async function setupWebhook() {
  try {
    // Delete existing webhook
    console.log('🗑️ Deleting existing webhook...');
    await bot.telegram.deleteWebhook();
    
    // Set new webhook
    console.log(`🔗 Setting webhook to: ${webhookUrl}`);
    await bot.telegram.setWebhook(webhookUrl);
    
    // Verify webhook
    console.log('🔍 Verifying webhook...');
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('Webhook info:', webhookInfo);
    
    if (webhookInfo.url === webhookUrl) {
      console.log('✅ Webhook successfully configured!');
    } else {
      console.error('❌ Webhook configuration failed!');
      console.error('Expected:', webhookUrl);
      console.error('Got:', webhookInfo.url);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
  }
}

setupWebhook(); 