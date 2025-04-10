import { Context } from 'telegraf';
import { REFERRAL_BONUS } from '../../utils/points';

export const handleInvite = async (ctx: Context) => {
  try {
    const telegramId = ctx.from?.id.toString();
    const username = ctx.from?.username;

    if (!telegramId) {
      await ctx.reply('❌ Error: Could not identify your Telegram account.');
      return;
    }

    // Créer le lien d'invitation
    const inviteLink = `https://t.me/${ctx.botInfo?.username}?start=${telegramId}`;
    
    // Message avec le lien d'invitation
    const message = `🎁 Invite your friends to BUILDR Network and earn ${REFERRAL_BONUS} pBUILDR for each person who joins!\n\n` +
                   `Your invite link:\n${inviteLink}\n\n` +
                   `Share this link with your friends. When they join the bot, you'll earn pBUILDR rewards!`;

    await ctx.reply(message);
  } catch (error: unknown) {
    console.error('Error in invite command:', error);
    await ctx.reply('❌ An error occurred while generating your invite link.');
  }
}; 