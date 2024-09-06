import { db } from '$lib/server/db/db.js';
import { user as userFromDBSchema } from '$lib/server/db/schema.js';
import { sendPasswordResetEmail } from '$lib/server/email.js';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { resetPasswordEmailSchema } from './schema.js';

export async function load() {
	const form = await superValidate(zod(resetPasswordEmailSchema));
	return { form };
}

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(resetPasswordEmailSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const databaseUser = await db
			.select()
			.from(userFromDBSchema)
			.where(eq(userFromDBSchema.email, form.data.email))
			.get();

		if (databaseUser !== undefined) {
			await sendPasswordResetEmail(
				databaseUser.id,
				databaseUser.email,
				`${databaseUser.firstName} ${databaseUser.lastName}`
			);
		}

		return message(
			form,
			'An email with a reset link has been sent to the provided email adress if an account exists for it. The link is valid for 15 minutes.'
		);
	}
};
