import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { user as userTable } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { userFormSchema } from '../../userFormSchema.js';

export async function load({ locals, params: { userId } }) {
	const { user: connectedUser } = await locals.authRequest.validateUser();

	if (
		connectedUser === null ||
		(connectedUser.role !== RolesEnum.Enum.admin && connectedUser.id !== userId)
	) {
		throw error(403);
	}

	const user = await locals.db.select().from(userTable).where(eq(userTable.id, userId)).get();

	if (!user) {
		throw error(404);
	}

	const form = await superValidate(
		{
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: user.role === RolesEnum.Enum.admin
		},
		userFormSchema
	);

	return { form };
}

export const actions = {
	default: async ({ params: { userId }, locals, request }) => {
		const { user: connectedUser } = await locals.authRequest.validateUser();

		if (
			connectedUser === null ||
			(connectedUser.role !== RolesEnum.Enum.admin && connectedUser.id !== userId)
		) {
			throw error(403);
		}

		const user = await locals.db.select().from(userTable).where(eq(userTable.id, userId)).get();

		if (!user) {
			throw error(404);
		}

		const form = await superValidate(request, userFormSchema);

		if (!form.valid) {
			return setError(form, null, 'An error occured');
		}

		const existingUserName = await locals.db
			.select()
			.from(userTable)
			.where(
				and(
					eq(userTable.firstName, form.data.firstName),
					eq(userTable.lastName, form.data.lastName),
					ne(userTable.id, userId)
				)
			)
			.all();

		if (existingUserName.length !== 0) {
			return setError(form, null, 'First name and last name conbination allready exists');
		}

		const existingEmail = await locals.db
			.select()
			.from(userTable)
			.where(and(eq(userTable.email, form.data.email), ne(userTable.id, userId)))
			.all();

		if (existingEmail.length !== 0) {
			return setError(form, 'email', 'Email allready linked to an account');
		}

		if (form.data.email !== user.email) {
			return setError(
				form,
				'email',
				'Not possible to update email yet (ask the developper if needed).'
			);
			// locals.auth.deleteKey('email', user.email);

			// locals.auth.updateKeyPassword

			// await locals.auth.updateUserAttributes(userId, {
			// 	first_name: form.data.firstName,
			// 	last_name: form.data.lastName,
			// 	email: form.data.email,
			// 	email_verified: 0,
			// 	password_expired: 1,
			// 	role: form.data.isAdmin ? RolesEnum.Enum.admin : RolesEnum.Enum.default
			// });
		} else {
			await locals.auth.updateUserAttributes(userId, {
				first_name: form.data.firstName,
				last_name: form.data.lastName,
				role: form.data.isAdmin ? RolesEnum.Enum.admin : RolesEnum.Enum.default
			});
		}

		throw redirect(302, '/users');
	}
};
