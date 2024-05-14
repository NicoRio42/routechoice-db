import { db } from '$lib/server/db/db.js';
import { event as eventTable } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params: { eventId } }) {
	const eventInfo = await db
		.select({ name: eventTable.name, publishTime: eventTable.publishTime })
		.from(eventTable)
		.where(eq(eventTable.id, eventId))
		.get();

	if (eventInfo === undefined) throw error(404);

	return { eventInfo };
}
