import { validateEmailVerificationToken } from '$lib/server/auth/tokens.js';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ params, locals }) => {
	const userId = await validateEmailVerificationToken(params.token, locals.db);

	if (!userId) {
		return new Response('Invalid or expired token', {
			status: 422
		});
	}

	await locals.auth.invalidateAllUserSessions(userId);

	await locals.auth.updateUserAttributes(userId, {
		email_verified: 1
	});

	const session = await locals.auth.createSession({ userId, attributes: {} });

	locals.authRequest.setSession(session);
	throw redirect(302, '/');
};
