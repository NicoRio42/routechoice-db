import { user as userTable } from '$lib/server/db/schema.js';

export function load({ locals }) {
	const users = locals.db
		.select({
			id: userTable.id,
			firstName: userTable.firstName,
			lastName: userTable.lastName,
			email: userTable.email,
			emailVerified: userTable.emailVerified,
			role: userTable.role,
			passwordExpired: userTable.passwordExpired
		})
		.from(userTable)
		.all();

	return { users };
}
