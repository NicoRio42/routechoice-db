import { redirect } from '@sveltejs/kit';
import { loginFormSchema } from './schema.js';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { key as keyTable, user as userTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/db.js';
import { validateScryptHash } from '$lib/server/auth/crypto.js';
import { auth } from '$lib/server/auth/auth.js';

export const load = async ({ locals }) => {
	if (locals.user !== null) throw redirect(302, '/events');

	const form = await superValidate(loginFormSchema);
	return { form };
};

export const actions = {
	default: async ({ request, cookies, url, locals }) => {
		if (locals.user !== null) throw redirect(302, '/events');

		const form = await superValidate(request, loginFormSchema);
		const { email, password } = form.data;

		if (!form.valid) {
			return setError(form, '', 'An error occured');
		}

		const queryResult = await db
			.select()
			.from(userTable)
			.innerJoin(keyTable, eq(keyTable.userId, userTable.id))
			.where(eq(userTable.email, email))
			.get();

		if (queryResult === undefined) {
			return setError(form, '', "This account doesn't exist");
		}
		const { auth_user: existingUser, auth_key: key } = queryResult;

		if (existingUser.passwordExpired || key.hashedPassword === null) {
			return setError(
				form,
				'',
				'Your password has expired, you will have to reset it. Please follow the reset password link above.'
			);
		}

		const isPasswordMatching = await validateScryptHash(password, key.hashedPassword);
		if (!isPasswordMatching) return setError(form, '', 'Incorrect email or password');

		const session = await auth.createSession(existingUser.id, {});
		const sessionCookie = auth.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		const redirectToSearchParam = url.searchParams.get('redirectTo');

		if (redirectToSearchParam === null) {
			throw redirect(302, '/events');
		}

		let urlString = '/events';

		try {
			const url = new URL(redirectToSearchParam);
			urlString = url.toString();
		} catch (e) {
			console.error(e);
		}

		throw redirect(302, urlString);
	}
};
