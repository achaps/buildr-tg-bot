import { Context } from 'telegraf';
import { supabase } from '../../services/supabaseClient';
import { calculateDailyPoints, canCheckIn, formatPoints } from '../../utils/points';

export const handleDaily = async (ctx: Context) => {
  try {
    const telegramId = ctx.from?.id.toString();

    if (!telegramId) {
      await ctx.reply('❌ Error: Could not identify your Telegram account.');
      return;
    }

    // Get user's check-in status
    const { data: checkin, error: checkinError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (checkinError && checkinError.code !== 'PGRST116') throw checkinError;

    if (checkin && !canCheckIn(checkin.last_checkin)) {
      await ctx.reply('⏳ You have already checked in today. Come back tomorrow!');
      return;
    }

    // Calculate new streak and points
    const currentStreak = checkin ? checkin.streak + 1 : 1;
    const pointsEarned = calculateDailyPoints(currentStreak);

    // Update or create check-in record
    const { error: upsertError } = await supabase
      .from('daily_checkins')
      .upsert({
        telegram_id: telegramId,
        last_checkin: new Date().toISOString(),
        streak: currentStreak,
      });

    if (upsertError) throw upsertError;

    // Update user's total points
    const { data: user, error: userError } = await supabase
      .from('tg-users')
      .select('total_points')
      .eq('telegram_id', telegramId)
      .single();

    if (userError) throw userError;

    const { error: updateError } = await supabase
      .from('tg-users')
      .update({ total_points: user.total_points + pointsEarned })
      .eq('telegram_id', telegramId);

    if (updateError) throw updateError;

    await ctx.reply(
      `✅ Daily check-in successful!\n\n` +
      `🎯 Streak: ${currentStreak} days\n` +
      `💰 Earned: ${formatPoints(pointsEarned)}\n` +
      `💎 Total: ${formatPoints(user.total_points + pointsEarned)}`
    );
  } catch (error: unknown) {
    console.error('Error in daily command:', error);
    await ctx.reply('❌ An error occurred while processing your daily check-in.');
  }
}; 