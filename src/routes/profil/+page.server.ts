import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	return {
		user
	};
}

export const actions = {
	default: async ({ locals }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		await locals.auth.deleteUser(user.id ?? '');
		redirect(302, '/login');
	}
};
