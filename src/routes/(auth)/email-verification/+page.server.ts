import { generateEmailVerificationToken } from '$lib/server/auth/tokens.js';
import { sendEmailVerificationEmail } from '$lib/server/email.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();

	if (!session) {
		throw redirect(302, '/login');
	}

	if (session.user.emailVerified) {
		throw redirect(302, '/');
	}

	return { sent: false };
}

export const actions = {
	default: async ({ locals, fetch }) => {
		const session = await locals.authRequest.validate();

		if (!session) {
			throw redirect(302, '/login');
		}

		if (session.user.emailVerified) {
			throw redirect(302, '/');
		}

		const token = await generateEmailVerificationToken(session.user.userId, locals.db);

		await sendEmailVerificationEmail(
			session.user.email,
			`${session.user.firstName} ${session.user.lastName}`,
			token,
			fetch
		);

		return { sent: true };
	}
};
