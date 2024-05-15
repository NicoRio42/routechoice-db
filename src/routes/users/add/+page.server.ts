import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { key as keyTable, user as userDBShema } from '$lib/server/db/schema.js';
import { sendPasswordResetEmail } from '$lib/server/email.js';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userFormSchema } from '../userFormSchema.js';

export async function load({ locals }) {
	redirectIfNotAdmin(locals.user);

	const form = await superValidate(zod(userFormSchema));
	return { form };
}

export const actions = {
	default: async ({ request, locals }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const form = await superValidate(request, zod(userFormSchema));

		if (!form.valid) {
			return setError(form, '', 'An error occured');
		}

		const existingUser = await db
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
			return setError(form, '', 'First name and last name conbination allready exists');
		}

		const existingEmail = await db
			.select()
			.from(userDBShema)
			.where(eq(userDBShema.email, form.data.email))
			.all();

		if (existingEmail.length !== 0) {
			return setError(form, 'email', 'Email allready linked to an account');
		}

		const id = generateId(15);

		await db
			.insert(userDBShema)
			.values({
				id,
				firstName: form.data.firstName,
				lastName: form.data.lastName,
				email: form.data.email,
				role: form.data.isAdmin ? RolesEnum.Enum.admin : RolesEnum.Enum.default
			})
			.run();

		await db.insert(keyTable).values({ userId: id }).run();

		await sendPasswordResetEmail(
			id,
			form.data.email,
			`${form.data.firstName} ${form.data.lastName}`
		);

		throw redirect(302, '/users');
	}
};
