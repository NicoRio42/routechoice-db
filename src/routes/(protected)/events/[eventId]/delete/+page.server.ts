import { event } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
	default: async ({ locals, params: { eventId } }) => {
		const eventIdInt = parseInt(eventId, 10);
		if (isNaN(eventIdInt)) throw fail(400);
		await locals.db.delete(event).where(eq(event.id, eventIdInt)).run();

		throw redirect(302, '/');
	}
};
