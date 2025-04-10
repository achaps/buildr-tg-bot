import { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { Request, Response } from 'express';

const bot = new Telegraf(env.BOT_TOKEN);

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