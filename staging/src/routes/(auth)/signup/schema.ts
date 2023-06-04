import { NUMBERS } from '$lib/constants.js';
import { z } from 'zod';

export const signUpFormSchema = z
	.object({
		name: z.string().describe('Name').nonempty('User name should not be empty'),
		email: z.string().email('Please enter a valid email'),
		password: z
			.string()
			.min(8, 'Password should have at least 8 characters')
			.refine(
				(arg) => NUMBERS.some((n) => arg.includes(n)),
				'Password should contain at least one number'
			),
		passwordConfirmation: z.string()
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Passwords don't match",
		path: ['passwordConfirmation']
	});
