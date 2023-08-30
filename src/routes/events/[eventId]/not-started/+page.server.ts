import { event as eventTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function load({ params: { eventId }, locals }) {
	const eventInfo = await locals.db
		.select({ name: eventTable.name, publishTime: eventTable.publishTime })
		.from(eventTable)
		.where(eq(eventTable.id, eventId))
		.get();

	return { eventInfo };
}
