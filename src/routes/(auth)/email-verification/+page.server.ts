import { sendEmailVerificationEmail } from '$lib/server/email.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const { user } = await locals.authRequest.validateUser();
	if (!user) throw redirect(301, '/login');
	if (user.emailVerified) throw redirect(301, '/');

	return { sent: false };
}

export const actions = {
	default: async ({ locals }) => {
		const { user } = await locals.authRequest.validateUser();
		if (!user) throw redirect(301, '/login');
		if (user.emailVerified) throw redirect(301, '/');

		await locals.emailVerificationToken.invalidateAllUserTokens(user.id);
		const token = await locals.emailVerificationToken.issue(user.id);
		await sendEmailVerificationEmail(user.email, user.name, token.toString());

		return { sent: true };
	}
};
