import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { event as eventDb } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals, params: { eventId } }) {
	redirectIfNotAdmin(locals.user);

	const event = await db.query.event.findFirst({
		where: eq(eventDb.id, eventId),
		with: { legs: { columns: { id: true } } }
	});

	if (event === undefined) throw error(404);
	return { event };
}
