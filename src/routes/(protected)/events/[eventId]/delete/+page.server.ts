import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { event } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
	default: async ({ locals, params: { eventId } }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		await locals.db.delete(event).where(eq(event.id, eventId)).run();

		throw redirect(302, '/');
	}
};
