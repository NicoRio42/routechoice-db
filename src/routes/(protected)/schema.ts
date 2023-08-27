import { z } from 'zod';

export const filterEventFormSchema = z.object({
	tags: z.string().transform((arg) => arg.split(',').filter((s) => s !== ''))
});
