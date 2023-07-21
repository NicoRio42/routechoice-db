import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ locals, params }) => {
		const { user } = await locals.authRequest.validateUser();
		if (!user) throw redirect(302, '/login');
		if (!user.emailVerified) throw redirect(302, '/email-verification');

		if (user.role !== RolesEnum.Enum.admin && user.id !== params.userId) {
			throw redirect(302, '/');
		}

		await locals.auth.deleteUser(params.userId);
		throw redirect(302, '/users');
	}
};
