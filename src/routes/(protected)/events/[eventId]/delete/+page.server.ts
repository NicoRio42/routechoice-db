import { event } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
	default: async ({ locals, params: { eventId } }) => {
		const { user } = await locals.authRequest.validateUser();
		if (!user) throw redirect(302, '/login');
		if (user.emailVerified === 0) throw redirect(302, '/email-verification');

		await locals.db.delete(event).where(eq(event.id, eventId)).run();

		throw redirect(302, '/');
	}
};
