import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

async function checkWebhook() {
  try {
    // Test bot token validity first
    console.log('🔍 Testing bot token...');
    const meResponse = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    );
    console.log('✅ Bot Info:', JSON.stringify(meResponse.data, null, 2));

    // Check webhook info
    console.log('\n🔍 Checking webhook configuration...');
    const webhookResponse = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    console.log('Webhook Info:', JSON.stringify(webhookResponse.data, null, 2));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error:', error.response?.data || error.message);
    } else {
      console.error('❌ Error:', error);
    }
  }
}

checkWebhook(); 