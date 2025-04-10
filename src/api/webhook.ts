import { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { Request, Response } from 'express';
import crypto from 'crypto';

const bot = new Telegraf(env.BOT_TOKEN);

export default async function handler(req: Request, res: Response) {
  if (req.method === 'POST') {
    try {
      // Vérifier la signature Telegram
      const secretToken = crypto
        .createHash('sha256')
        .update(env.BOT_TOKEN)
        .digest('hex');
      
      const signature = req.headers['x-telegram-bot-api-secret-token'];
      
      if (signature !== secretToken) {
        console.error('Invalid webhook signature');
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Log the incoming update for debugging
      console.log('Received update:', JSON.stringify(req.body, null, 2));

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