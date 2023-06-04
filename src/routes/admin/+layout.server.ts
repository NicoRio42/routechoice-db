import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const { user } = await locals.authRequest.validateUser();
	if (!user) throw redirect(302, '/');
	if (user.emailVerified === 0) throw redirect(302, '/email-verification');
	if (user.role !== RolesEnum.Enum.admin) throw redirect(302, '/');
}
