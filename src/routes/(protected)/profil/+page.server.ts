import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	return {
		user
	};
}

export const actions = {
	default: async ({ locals }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		await locals.auth.deleteUser(user.id ?? '');
		redirect(302, '/login');
	}
};
