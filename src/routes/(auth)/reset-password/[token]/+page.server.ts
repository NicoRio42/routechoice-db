import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { resetPasswordSchema } from './schema.js';
import { validatePasswordResetToken } from '$lib/server/auth/tokens.js';

export async function load() {
	const form = await superValidate(resetPasswordSchema);
	return { form };
}

export const actions = {
	default: async ({ request, locals, params }) => {
		const form = await superValidate(request, resetPasswordSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const userId = await validatePasswordResetToken(params.token ?? '', locals.db);

			if (userId === null) {
				throw redirect(302, '/login');
			}

			let user = await locals.auth.getUser(userId);

			if (!user.emailVerified) {
				user = await locals.auth.updateUserAttributes(user.id, {
					email_verified: 1
				});
			}

			if (user.passwordExpired) {
				user = await locals.auth.updateUserAttributes(user.id, {
					password_expired: 0
				});
			}

			await locals.auth.invalidateAllUserSessions(user.id);
			await locals.auth.updateKeyPassword('email', user.email, form.data.password);

			const session = await locals.auth.createSession({ userId: user.id, attributes: {} });
			locals.authRequest.setSession(session);
		} catch (e) {
			console.error(e);

			return setError(form, null, 'An error occured');
		}

		throw redirect(302, '/');
	}
};
