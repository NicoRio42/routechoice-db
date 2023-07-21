import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const { user } = await locals.authRequest.validateUser();

	if (user === null || user.role !== RolesEnum.Enum.admin) {
		throw redirect(302, '/');
	}
}
