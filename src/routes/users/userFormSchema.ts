import { z } from 'zod';

export const userFormSchema = z.object({
	firstName: z.string().describe('Name').nonempty('User first name should not be empty'),
	lastName: z.string().describe('Name').nonempty('User last name should not be empty'),
	email: z.string().email('Please enter a valid email'),
	isAdmin: z.boolean()
});
