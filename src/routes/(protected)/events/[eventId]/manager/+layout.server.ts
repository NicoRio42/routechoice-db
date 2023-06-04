import { event as eventDb } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals, params: { eventId } }) {
	const eventIdInt = parseInt(eventId, 10);
	if (isNaN(eventIdInt)) throw error(404);
	const event = await locals.db.select().from(eventDb).where(eq(eventDb.id, eventIdInt)).get();

	return { event };
}
