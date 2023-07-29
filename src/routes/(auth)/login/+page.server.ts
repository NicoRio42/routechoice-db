import { redirect } from '@sveltejs/kit';
import { loginFormSchema } from './schema.js';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { user as userTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { LuciaError } from 'lucia';

export const load = async ({ locals }) => {
	const session = await locals.authRequest.validate();
	if (session) throw redirect(302, '/');

	const form = await superValidate(loginFormSchema);
	return { form };
};

export const actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate(request, loginFormSchema);

		if (!form.valid) {
			return setError(form, null, 'An error occured');
		}

		const user = await locals.db
			.select()
			.from(userTable)
			.where(eq(userTable.email, form.data.email))
			.get();

		if (user === undefined) {
			return setError(form, null, "This account doesn't exist");
		}

		if (user.passwordExpired) {
			return setError(
				form,
				null,
				'Your password has expired, you will have to reset it. Please follow the reset password link above.'
			);
		}

		try {
			const key = await locals.auth.useKey('email', form.data.email, form.data.password);
			const session = await locals.auth.createSession({ userId: key.userId, attributes: {} });
			locals.authRequest.setSession(session);
		} catch (e) {
			console.error(e);

			if (
				e instanceof LuciaError &&
				(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
			) {
				return setError(form, null, 'Incorrect email or password');
			}

			return setError(form, null, 'An unknown error occurred');
		}

		const redirectToSearchParam = url.searchParams.get('redirectTo');

		if (redirectToSearchParam === null) {
			throw redirect(302, '/');
		}

		let urlString = '/';

		try {
			const url = new URL(redirectToSearchParam);
			urlString = url.toString();
		} catch (e) {
			console.error(e);
		}

		throw redirect(302, urlString);
	}
};
