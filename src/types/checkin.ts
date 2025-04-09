import { z } from 'zod';

export const checkinSchema = z.object({
  telegram_id: z.string(),
  last_checkin: z.string().datetime(),
  streak: z.number().default(0),
});

export type Checkin = z.infer<typeof checkinSchema>; 