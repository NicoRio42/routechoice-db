import { auth } from '$lib/server/auth/auth.js';
import { db } from '$lib/server/db/db.js';
import { emailVerificationCodeTable, user as userTable } from '$lib/server/db/schema.js';
import { sendVerificationCodeEmail } from '$lib/server/email.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { isWithinExpirationDate } from 'oslo';

export async function load({ locals }) {
	if (!locals.user) throw redirect(302, '/login');
	if (locals.user.emailVerified) throw redirect(302, '/events');

	return { email: locals.user.email };
}

export const actions = {
	verifyCode: async ({ locals, request, cookies }) => {
		if (!locals.user) throw redirect(302, '/login');
		if (locals.user.emailVerified) throw redirect(302, '/events');

		const formdata = await request.formData();
		const code = formdata.get('code');

		if (code === null || code instanceof File) return fail(400);

		const verificationCode = await db
			.select()
			.from(emailVerificationCodeTable)
			.where(eq(emailVerificationCodeTable.fkUser, locals.user.id))
			.get();

		if (verificationCode !== undefined) {
			await db
				.delete(emailVerificationCodeTable)
				.where(eq(emailVerificationCodeTable.fkUser, locals.user.id))
				.run();
		} else {
			return { wrongCode: false, codeExpired: true, codeResent: false };
		}

		if (!isWithinExpirationDate(verificationCode.expiresAt)) {
			return { wrongCode: false, codeExpired: true, codeResent: false };
		}

		if (code !== verificationCode.code) {
			return { wrongCode: true, codeExpired: false, codeResent: false };
		}

		auth.invalidateUserSessions(locals.user.id);

		await db
			.update(userTable)
			.set({ emailVerified: true })
			.where(eq(userTable.id, locals.user.id))
			.run();

		const session = await auth.createSession(locals.user.id, {});
		const sessionCookie = auth.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, '/events');
	},
	sendNewVerificationCode: async ({ locals }) => {
		if (!locals.user) throw redirect(302, '/login');
		if (locals.user.emailVerified) throw redirect(302, '/events');

		sendVerificationCodeEmail(
			locals.user.id,
			locals.user.email,
			`${locals.user.firstName} ${locals.user.lastName}`
		);

		return { wrongCode: false, codeExpired: false, codeResent: true };
	}
};
