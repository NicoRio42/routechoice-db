import { redirectIfNotLogedIn } from '$lib/server/auth/helpers.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotLogedIn(user);
}
