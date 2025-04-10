import { Context } from 'telegraf';
import { supabase } from '../../services/supabaseClient';
import { INITIAL_POINTS, REFERRAL_BONUS, formatPoints } from '../../utils/points';
import { userSchema } from '../../types/user';

export const handleStart = async (ctx: Context) => {
  try {
    const telegramId = ctx.from?.id.toString();
    const username = ctx.from?.username;
    
    // Check if message is a text message
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('❌ Please use text commands only.');
      return;
    }
    
    const args = ctx.message.text.split(' ');

    if (!telegramId) {
      await ctx.reply('❌ Error: Could not identify your Telegram account.');
      return;
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('tg-users')
      .select()
      .eq('telegram_id', telegramId)
      .single();

    if (existingUser) {
      await ctx.reply(`👋 Welcome back! You already have ${formatPoints(existingUser.total_points)}.`);
      return;
    }

    // Handle referral if present
    let referredBy = null;
    if (args && args.length > 1) {
      const referrerId = args[1];
      const { data: referrer } = await supabase
        .from('tg-users')
        .select('total_points')
        .eq('telegram_id', referrerId)
        .single();

      if (referrer) {
        referredBy = referrerId;
        // Add referral bonus to referrer
        await supabase
          .from('tg-users')
          .update({ total_points: referrer.total_points + REFERRAL_BONUS })
          .eq('telegram_id', referrerId);
      }
    }

    // Create new user
    const newUser = {
      telegram_id: telegramId,
      username,
      total_points: INITIAL_POINTS,
      referred_by: referredBy,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('tg-users')
      .insert([newUser]);

    if (error) throw error;

    let message = `🎉 Welcome to Buildr! You've received ${formatPoints(INITIAL_POINTS)} for joining.\n\n` +
                 `To get started:\n\n` +
                 `1️⃣ Join our group: @buildr_network\n` +
                 `2️⃣ Introduce yourself in the General Hub: https://t.me/buildr_network/13\n\n` +
                 `These steps are required to access bot features and earn rewards!`;

    if (referredBy) {
      message += `\n🎁 You were referred by another user!`;
    }

    await ctx.reply(message);
  } catch (error: unknown) {
    console.error('Error in start command:', error);
    await ctx.reply('❌ An error occurred while processing your request.');
  }
}; 