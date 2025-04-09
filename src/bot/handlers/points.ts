import { Context } from 'telegraf';
import { supabase } from '../../services/supabaseClient';
import { formatPoints } from '../../utils/points';

export const handlePoints = async (ctx: Context) => {
  try {
    const telegramId = ctx.from?.id.toString();

    if (!telegramId) {
      await ctx.reply('❌ Error: Could not identify your Telegram account.');
      return;
    }

    const { data: user, error } = await supabase
      .from('tg-users')
      .select('total_points')
      .eq('telegram_id', telegramId)
      .single();

    if (error) throw error;

    if (!user) {
      await ctx.reply('❌ You need to start the bot first using /start');
      return;
    }

    await ctx.reply(`💰 Your current balance: ${formatPoints(user.total_points)}`);
  } catch (error: unknown) {
    console.error('Error in points command:', error);
    await ctx.reply('❌ An error occurred while fetching your points.');
  }
}; 