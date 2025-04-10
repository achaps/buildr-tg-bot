import { Context } from 'telegraf';
import { supabase } from '../../services/supabaseClient';

const REQUIRED_GROUP = '@buildr_network';
const GENERAL_HUB_TOPIC = 13;

export const verifyGroupMembership = async (ctx: Context, next: () => Promise<void>) => {
  const userId = ctx.from?.id;
  
  if (!userId) {
    await ctx.reply('❌ Could not identify your account.');
    return;
  }

  try {
    const member = await ctx.telegram.getChatMember(REQUIRED_GROUP, userId);
    
    if (!['member', 'administrator', 'creator'].includes(member.status)) {
      await ctx.reply(
        `⚠️ You must join our group to use this feature!\n\n` +
        `Please join: ${REQUIRED_GROUP}\n\n` +
        'Once you\'ve joined, try your command again!'
      );
      return;
    }

    // Check if user has posted in General Hub topic
    const { data: hasPosted } = await supabase
      .from('group_activity')
      .select('*')
      .eq('telegram_id', userId)
      .eq('topic_id', GENERAL_HUB_TOPIC)
      .single();

    if (!hasPosted) {
      await ctx.reply(
        '⚠️ You need to introduce yourself in our General Hub topic!\n\n' +
        'Please post a message here: https://t.me/buildr_network/13\n\n' +
        'Tell us about yourself and your interests!'
      );
      return;
    }

    // All checks passed, proceed
    return next();
  } catch (error) {
    console.error(`Error checking group membership:`, error);
    await ctx.reply('❌ An error occurred while verifying your group membership.');
  }
}; 