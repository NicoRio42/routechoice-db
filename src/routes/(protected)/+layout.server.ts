import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const { user } = await locals.authRequest.validateUser();
	if (!user || user.passwordExpired) throw redirect(302, '/login');
	if (!user.emailVerified) throw redirect(302, '/email-verification');
}
