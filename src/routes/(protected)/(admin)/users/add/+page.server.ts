import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { user as userDBShema } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { userFormSchema } from '../userFormSchema.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user: connectedUser } = session;

	redirectIfNotAdmin(connectedUser);

	const form = await superValidate(userFormSchema);
	return { form };
}

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user: connectedUser } = session;

		if (!connectedUser || connectedUser.role !== RolesEnum.Enum.admin) {
			throw redirect(302, '/login');
		}

		const form = await superValidate(request, userFormSchema);

		if (!form.valid) {
			return setError(form, null, 'An error occured');
		}

		const existingUser = await locals.db
			.select()
			.from(userDBShema)
			.where(
				and(
					eq(userDBShema.firstName, form.data.firstName),
					eq(userDBShema.lastName, form.data.lastName)
				)
			)
			.all();

		if (existingUser.length !== 0) {
			return setError(form, null, 'First name and last name conbination allready exists');
		}

		const existingEmail = await locals.db
			.select()
			.from(userDBShema)
			.where(eq(userDBShema.email, form.data.email))
			.all();

		if (existingEmail.length !== 0) {
			return setError(form, 'email', 'Email allready linked to an account');
		}

		await locals.auth.createUser({
			key: {
				providerId: 'email',
				providerUserId: form.data.email,
				password: crypto.randomUUID()
			},
			attributes: {
				first_name: form.data.firstName,
				last_name: form.data.lastName,
				email: form.data.email,
				role: form.data.isAdmin ? RolesEnum.Enum.admin : RolesEnum.Enum.default,
				email_verified: 0,
				password_expired: 1
			}
		});

		throw redirect(302, '/users');
	}
};
