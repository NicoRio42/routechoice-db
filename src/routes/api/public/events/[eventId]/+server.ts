import { sortLegs, sortRunnersAndRunnersLegs } from '$lib/helpers.js';
import { db } from '$lib/server/db/db.js';
import { event as eventTable } from '$lib/server/db/schema.js';
import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ params: { eventId } }) {
	const event = await db.query.event.findFirst({
		where: eq(eventTable.id, eventId),
		with: {
			runners: { with: { legs: true } },
			legs: true,
			controlPoints: true
		}
	});

	if (event === undefined) {
		throw error(404, 'No event found for this id.');
	}

	const sortedLegs = sortLegs(event.legs, false);

	return json({
		...event,
		legs: sortedLegs,
		runners: sortRunnersAndRunnersLegs(event.runners, sortedLegs)
	});
}
