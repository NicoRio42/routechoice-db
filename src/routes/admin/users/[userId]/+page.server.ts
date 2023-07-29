import { redirectIfNotAdminOrNotCurrentUser } from '$lib/server/auth/helpers.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
	delete: async ({ locals, params: { userId } }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdminOrNotCurrentUser(user, userId);

		await locals.auth.deleteUser(userId);
	}
};
