import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  gender: z.string().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
