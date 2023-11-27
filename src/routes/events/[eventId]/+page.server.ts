import {
	getEventMap,
	getTracksFromLiveEvents,
	sortLegs,
	sortRunnersAndRunnersLegs
} from '$lib/helpers.js';
import { event as eventTable } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params: { eventId }, locals, fetch }) {
	const session = await locals.authRequest.validate();

	const event = await locals.db.query.event.findFirst({
		where: eq(eventTable.id, eventId),
		with: {
			liveEvents: true,
			runners: { with: { legs: true } },
			legs: { with: { routechoices: { with: { statistics: true } } } },
			controlPoints: true
		}
	});

	if (event === undefined) throw error(404, 'Event not found');

	if (new Date().getTime() < event.publishTime.getTime()) {
		throw redirect(302, `/events/${eventId}/not-started`);
	}

	const eventWithSortedLegs = { ...event, legs: sortLegs(event.legs) };

	return {
		event: {
			...eventWithSortedLegs,
			runners: sortRunnersAndRunnersLegs(
				eventWithSortedLegs.runners.map((r) => ({ ...r, track: null })),
				eventWithSortedLegs.legs
			)
		},
		eventMap: getEventMap(event.liveEvents[0], fetch),
		user: session?.user ?? null,
		promises: { tracks: getTracksFromLiveEvents(eventWithSortedLegs.liveEvents, fetch) }
	};
}
