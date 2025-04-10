import { Context } from 'telegraf';
import { supabase } from '../../services/supabaseClient';
import { REFERRAL_BONUS, formatPoints } from '../../utils/points';

export const handleReferrals = async (ctx: Context) => {
  try {
    const telegramId = ctx.from?.id.toString();

    if (!telegramId) {
      await ctx.reply('❌ Error: Could not identify your Telegram account.');
      return;
    }

    // Récupérer le nombre de referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('tg-users')
      .select('referred_by')
      .eq('referred_by', telegramId);

    if (referralsError) throw referralsError;

    const referralCount = referrals?.length || 0;
    const totalPointsEarned = referralCount * REFERRAL_BONUS;

    // Message avec les statistiques
    const message = `📊 Your referral statistics:\n\n` +
                   `👥 People invited: ${referralCount}\n` +
                   `💰 Points earned from referrals: ${formatPoints(totalPointsEarned)}\n\n` +
                   `Use /invite to generate a new invitation link!`;

    await ctx.reply(message);
  } catch (error: unknown) {
    console.error('Error in referrals command:', error);
    await ctx.reply('❌ An error occurred while fetching your referral statistics.');
  }
}; 