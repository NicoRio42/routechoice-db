import { redirect } from '@sveltejs/kit';
import { loginFormSchema } from './schema.js';
import { setError, superValidate } from 'sveltekit-superforms/server';

export const load = async ({ locals }) => {
	const session = await locals.authRequest.validate();
	if (session) throw redirect(302, '/');
	const form = await superValidate(loginFormSchema);
	return { form };
};

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, loginFormSchema);

		if (!form.valid) {
			return setError(form, null, 'An error occured');
		}

		try {
			const key = await locals.auth.useKey('username', form.data.name, form.data.password);
			const session = await locals.auth.createSession(key.userId);
			locals.authRequest.setSession(session);
		} catch (e) {
			console.error(e);

			return setError(form, null, "This account doesn't exist");
		}

		throw redirect(302, '/');
	}
};
