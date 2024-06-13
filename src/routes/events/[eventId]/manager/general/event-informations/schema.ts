import { z } from 'zod';

export const generalInformationsSchema = z.object({
	name: z.string(),
	tags: z.array(z.string())
});
