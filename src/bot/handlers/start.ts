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
      // Message de bienvenue pour les utilisateurs existants
      const welcomeBackMessage = `👋 Welcome back to BUILDR Network! \n\n` +
                               `💰 Your current balance: ${formatPoints(existingUser.total_points)}\n\n` +
                               `Available Commands:\n\n` +
                               `💎 /points - Check your current balance\n\n` +
                               `📅 /daily - Claim your daily reward (available every 24h)\n\n` +
                               `📩 /invite - Get your referral link to earn ${formatPoints(REFERRAL_BONUS)} per friend\n\n` +
                               `📊 /referrals - View your referral statistics\n\n` +
                               `🏆 /leaderboard - See the top 10 earners\n\n` +
                               `Make sure to be active on the group and follow the development of the project!\n\n` +
                               `👉 @buildr_network`
      
      await ctx.reply(welcomeBackMessage);
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

    // Message d'introduction personnalisé pour les nouveaux utilisateurs
    let message = `🚀 Welcome to BUILDR Network! \n\n` +
                 `BUILDR Network is the first platform connecting Financiers, Builders & Community to create long-term ventures.\n\n` +
                 `🎁 You've received ${formatPoints(INITIAL_POINTS)} for joining!\n\n` +
                 `Available Commands:\n\n` +
                 `💎 /points - Check your current balance\n\n` +
                 `📅 /daily - Claim your daily reward (available every 24h)\n\n` +
                 `📩 /invite - Get your referral link to earn ${formatPoints(REFERRAL_BONUS)} per friend\n\n` +
                 `📊 /referrals - View your referral statistics\n\n` +
                 `🏆 /leaderboard - See the top 10 earners\n\n` +
                 `Next steps to unlock commands:\n\n` +
                 `1️⃣ Join our group: @buildr_network\n` +
                 `2️⃣ Introduce yourself in the General Hub: https://t.me/buildr_network/13\n\n` +
                 `These steps are required to access bot features and earn rewards!`;

    if (referredBy) {
      message += `\n\n🎁 You were referred by another user!`;
    }

    await ctx.reply(message);
  } catch (error: unknown) {
    console.error('Error in start command:', error);
    await ctx.reply('❌ An error occurred while processing your request.');
  }
}; 