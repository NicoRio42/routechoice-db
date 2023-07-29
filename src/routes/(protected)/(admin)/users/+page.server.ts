import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { user as userTable } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user: connectedUser } = session;

	redirectIfNotAdmin(connectedUser);

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
