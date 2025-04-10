import { Context } from 'telegraf';
import { supabase } from '../../services/supabaseClient';

export const handleGroupMessage = async (ctx: Context) => {
  const userId = ctx.from?.id.toString();
  const messageThreadId = ctx.message?.message_thread_id;
  
  if (!userId || !messageThreadId) return;

  // Only track messages in the General Hub topic
  if (messageThreadId === 13) {
    try {
      // Record the activity
      await supabase
        .from('group_activity')
        .upsert({
          telegram_id: userId,
          topic_id: messageThreadId,
          first_message_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error recording group activity:', error);
    }
  }
}; 