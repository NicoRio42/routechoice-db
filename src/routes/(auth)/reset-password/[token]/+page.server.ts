import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { resetPasswordSchema } from './schema.js';

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
			const token = await locals.passwordResetToken.validate(params.token ?? '');
			let user = await locals.auth.getUser(token.userId);

			if (!user.emailVerified) {
				user = await locals.auth.updateUserAttributes(user.id, {
					email_verified: 1
				});
			}

			await locals.auth.invalidateAllUserSessions(user.id);
			await locals.auth.updateKeyPassword('username', user.name, form.data.password);
			const session = await locals.auth.createSession(user.id);
			locals.authRequest.setSession(session);
		} catch (e) {
			console.error(e);

			return setError(form, null, 'An error occured');
		}

		throw redirect(302, '/');
	}
};
