import { z } from 'zod';

export const signUpFormSchema = z.object({
	firstName: z.string().describe('Name').nonempty('User name should not be empty'),
	lastName: z.string().describe('Name').nonempty('User name should not be empty'),
	email: z.string().email('Please enter a valid email'),
	isAdmin: z.boolean()
});
