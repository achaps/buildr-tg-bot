import dayjs from 'dayjs';

export const INITIAL_POINTS = 10;
export const REFERRAL_BONUS = 25;
export const BASE_DAILY_POINTS = 5;
export const MAX_DAILY_POINTS = 10;

export const calculateDailyPoints = (streak: number): number => {
  const points = BASE_DAILY_POINTS + (streak - 1);
  return Math.min(points, MAX_DAILY_POINTS);
};

export const canCheckIn = (lastCheckin: string | null): boolean => {
  if (!lastCheckin) return true;
  return !dayjs().isSame(dayjs(lastCheckin), 'day');
};

export const formatPoints = (points: number): string => {
  return `${points} pBUILDR`;
}; 