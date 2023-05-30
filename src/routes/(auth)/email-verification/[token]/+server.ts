import { LuciaTokenError } from '@lucia-auth/tokens';
import { error, redirect } from '@sveltejs/kit';

export const GET = async ({ params, locals }) => {
	const tokenParams = params.token;

	try {
		const token = await locals.emailVerificationToken.validate(tokenParams);
		await locals.auth.invalidateAllUserSessions(token.userId);

		await locals.auth.updateUserAttributes(token.userId, {
			email_verified: 1
		});

		const session = await locals.auth.createSession(token.userId);
		locals.authRequest.setSession(session);
	} catch (e) {
		if (e instanceof LuciaTokenError && e.message === 'EXPIRED_TOKEN') {
			throw error(401, 'Expired token');
		}
		if (e instanceof LuciaTokenError && e.message === 'INVALID_TOKEN') {
			throw error(401, 'Invalid token');
		}

		throw error(500);
	}

	throw redirect(302, '/');
};
