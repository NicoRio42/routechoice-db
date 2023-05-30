import { z } from 'zod';

export let resetPasswordEmailSchema = z.object({
	email: z.string().email('Please enter a valid email address')
});
