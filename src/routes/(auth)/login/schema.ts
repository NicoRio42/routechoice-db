import { z } from 'zod';

export const loginFormSchema = z.object({
	email: z.string().nonempty('Please enter a user name.').email('Please enter a valid email.'),
	password: z.string().nonempty('Please enter a password.')
});
