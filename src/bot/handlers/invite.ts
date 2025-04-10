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
    const message = `🎁 Invitez vos amis et gagnez ${REFERRAL_BONUS} points pour chaque personne qui rejoint!\n\n` +
                   `Votre lien d'invitation :\n${inviteLink}\n\n` +
                   `Partagez ce lien avec vos amis. Quand ils rejoignent le bot, vous gagnez des points !`;

    await ctx.reply(message);
  } catch (error: unknown) {
    console.error('Error in invite command:', error);
    await ctx.reply('❌ An error occurred while generating your invite link.');
  }
}; 