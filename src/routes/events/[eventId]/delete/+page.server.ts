import { db } from '$lib/server/db/db.js';
import { event } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
	default: async ({ locals, params: { eventId } }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		await db.delete(event).where(eq(event.id, eventId)).run();

		throw redirect(302, '/events');
	}
};
