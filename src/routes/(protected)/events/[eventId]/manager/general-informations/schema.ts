import { z } from 'zod';

export const generalInformationsSchema = z.object({
	name: z.string(),
	tags: z.string().transform((arg) => arg.split(','))
});
