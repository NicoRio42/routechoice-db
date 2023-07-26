import { z } from 'zod';

export const filterEventFormSchema = z.object({
	tags: z.string()
});
