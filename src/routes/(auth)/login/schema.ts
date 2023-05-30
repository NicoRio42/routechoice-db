import { z } from 'zod';

export const loginFormSchema = z.object({
	name: z.string().nonempty('Please enter a user name.'),
	password: z.string().nonempty('Please enter a password.')
});
