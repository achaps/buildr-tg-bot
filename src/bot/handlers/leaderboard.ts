import { Context } from 'telegraf';
import { supabase } from '../../services/supabaseClient';
import { formatPoints } from '../../utils/points';

interface LeaderboardUser {
  username: string | null;
  total_points: number;
}

export const handleLeaderboard = async (ctx: Context) => {
  try {
    const { data: users, error } = await supabase
      .from('tg-users')
      .select('username, total_points')
      .order('total_points', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!users || users.length === 0) {
      await ctx.reply('📊 No users found in the leaderboard yet.');
      return;
    }

    const leaderboardText = users
      .map((user: LeaderboardUser, index: number) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▫️';
        const username = user.username || 'Anonymous';
        return `${medal} ${index + 1}. @${username}: ${formatPoints(user.total_points)}`;
      })
      .join('\n');

    await ctx.reply(
      `🏆 *Top 10 Buildr Users* 🏆\n\n${leaderboardText}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error: unknown) {
    console.error('Error in leaderboard command:', error);
    await ctx.reply('❌ An error occurred while fetching the leaderboard.');
  }
}; 