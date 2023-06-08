import { event as eventDb } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals, params: { eventId } }) {
	const event = await locals.db.select().from(eventDb).where(eq(eventDb.id, eventId)).get();

	return { event };
}
