import { user as userDBSchema } from '$lib/server/db/schema.js';
import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const { user } = await locals.authRequest.validateUser();
	if (!user || user.role !== RolesEnum.Enum.admin) throw redirect(302, '/');

	const users = await locals.db.select().from(userDBSchema).all();

	return {
		user,
		users
	};
}
