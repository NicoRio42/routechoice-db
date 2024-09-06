import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { resetPasswordSchema } from './schema.js';
import {
	key as keyTable,
	passwordResetTokenTable,
	user as userTable
} from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { isWithinExpirationDate } from 'oslo';
import { db } from '$lib/server/db/db.js';
import { auth } from '$lib/server/auth/auth.js';
import { generateScryptHash } from '$lib/server/auth/crypto.js';

const PASSWORD_RESET_LINK_NOT_VALID_ERROR =
	'The password reset link in not valid anymore (valid for 15 minutes).';

export async function load({ params }) {
	const verificationToken = params.token;

	const passwordResetToken = await db
		.select()
		.from(passwordResetTokenTable)
		.where(eq(passwordResetTokenTable.id, verificationToken))
		.get();

	if (passwordResetToken === undefined) {
		throw error(400, PASSWORD_RESET_LINK_NOT_VALID_ERROR);
	}

	if (!isWithinExpirationDate(passwordResetToken.expiresAt)) {
		await db
			.delete(passwordResetTokenTable)
			.where(eq(passwordResetTokenTable.id, verificationToken))
			.run();

		throw error(400, PASSWORD_RESET_LINK_NOT_VALID_ERROR);
	}

	const form = await superValidate(zod(resetPasswordSchema));

	return { form };
}

export const actions = {
	default: async ({ request, params, cookies }) => {
		const form = await superValidate(request, zod(resetPasswordSchema));

		if (!form.valid) return fail(400, { form });

		const { password } = form.data;
		const verificationToken = params.token;

		const passwordResetToken = await db
			.select()
			.from(passwordResetTokenTable)
			.where(eq(passwordResetTokenTable.id, verificationToken))
			.get();

		if (passwordResetToken === undefined) {
			throw error(400, PASSWORD_RESET_LINK_NOT_VALID_ERROR);
		}

		if (!isWithinExpirationDate(passwordResetToken.expiresAt)) {
			await db
				.delete(passwordResetTokenTable)
				.where(eq(passwordResetTokenTable.id, verificationToken))
				.run();

			throw error(400, PASSWORD_RESET_LINK_NOT_VALID_ERROR);
		}

		await auth.invalidateUserSessions(passwordResetToken.fkUser);
		const hashedPassword = await generateScryptHash(password);

		await db
			.update(keyTable)
			.set({ hashedPassword })
			.where(eq(keyTable.userId, passwordResetToken.fkUser))
			.run();

		await db
			.update(userTable)
			.set({ emailVerified: true, passwordExpired: false })
			.where(eq(userTable.id, passwordResetToken.fkUser))
			.run();

		const session = await auth.createSession(passwordResetToken.fkUser, {});
		const sessionCookie = auth.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, '/events');
	}
};
