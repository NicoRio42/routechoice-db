import { z } from 'zod';

export const filterEventFormSchema = z.object({
	tags: z.array(z.string()),
	pageNumber: z.number().default(1),
	search: z.string()
});
