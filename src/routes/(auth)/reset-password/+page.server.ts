import { user as userFromDBSchema } from '$lib/server/db/schema.js';
import { sendPasswordResetEmail } from '$lib/server/email.js';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms/server';
import { resetPasswordEmailSchema } from './schema.js';

export async function load() {
	const form = await superValidate(resetPasswordEmailSchema);
	return { form };
}

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, resetPasswordEmailSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const databaseUser = await locals.db
				.select()
				.from(userFromDBSchema)
				.where(eq(userFromDBSchema.email, form.data.email))
				.get();

			if (databaseUser) {
				const token = await locals.passwordResetToken.issue(databaseUser.id);
				await sendPasswordResetEmail(databaseUser.email, databaseUser.name, token.toString());
			}

			return message(
				form,
				'An email has been sent to the provided email adress if an account exists for it.'
			);
		} catch (e) {
			console.error(e);

			return fail(500, {
				message: 'An unknown error occurred',
				email: form.data.email
			});
		}
	}
};
