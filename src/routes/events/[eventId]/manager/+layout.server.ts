import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { event as eventDb } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function load({ locals, params: { eventId } }) {
	redirectIfNotAdmin(locals.user);
	const event = await db.select().from(eventDb).where(eq(eventDb.id, eventId)).get();
	return { event };
}
