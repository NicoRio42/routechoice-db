import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const { user } = await locals.authRequest.validateUser();
	if (!user) throw redirect(302, '/login');
	if (user.emailVerified === 0) throw redirect(302, '/email-verification');
}
