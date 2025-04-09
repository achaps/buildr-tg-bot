import { z } from 'zod';

export const userSchema = z.object({
  telegram_id: z.string(),
  username: z.string().nullable(),
  total_points: z.number().default(0),
  referred_by: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>; 