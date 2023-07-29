import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { user as userDBSchema } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const users = await locals.db.select().from(userDBSchema).all();

	return {
		user,
		users
	};
}
