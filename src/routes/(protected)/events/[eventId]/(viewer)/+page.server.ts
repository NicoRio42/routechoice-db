import { getEventMap, getRunnersWithTracksAndSortedLegs, sortLegs } from '$lib/helpers.js';
import { event as eventTable } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params: { eventId }, locals, fetch }) {
	const { user } = await locals.authRequest.validateUser();

	const event = await locals.db.query.event.findFirst({
		where: eq(eventTable.id, eventId),
		with: {
			liveEvents: true,
			runners: { with: { legs: true } },
			legs: { with: { routechoices: true } },
			controlPoints: true
		}
	});

	if (event === undefined) throw error(404, 'Event not found');

	const eventWithSortedLegs = { ...event, legs: sortLegs(event.legs) };

	const runnersWithTracksAndSortedLegs = await getRunnersWithTracksAndSortedLegs(
		eventWithSortedLegs.legs,
		eventWithSortedLegs.liveEvents,
		eventWithSortedLegs.runners
	);

	return {
		event: { ...eventWithSortedLegs, runners: runnersWithTracksAndSortedLegs },
		eventMap: getEventMap(event.liveEvents[0], fetch),
		user
	};
}
