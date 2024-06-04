import { getEventMap, sortLegsAndRoutechoices, sortRunnersAndRunnersLegs } from '$lib/helpers.js';
import { db } from '$lib/server/db/db.js';
import { event as eventTable } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RunnerTrack } from 'orienteering-js/models';

export async function load({ params: { eventId }, locals, fetch }) {
	const event = await db.query.event.findFirst({
		where: eq(eventTable.id, eventId),
		with: {
			liveEvents: true,
			runners: { with: { legs: true } },
			legs: { with: { routechoices: true } },
			controlPoints: true
		}
	});

	if (event === undefined) throw error(404, 'Event not found');

	if (new Date().getTime() < event.publishTime.getTime()) {
		throw redirect(302, `/events/${eventId}/not-started`);
	}

	const eventWithSortedLegs = { ...event, legs: sortLegsAndRoutechoices(event.legs) };

	const runners = sortRunnersAndRunnersLegs(
		eventWithSortedLegs.runners.map((r) => {
			return { ...r, track: null as RunnerTrack | null };
		}),
		eventWithSortedLegs.legs
	);

	runners[0].track;

	return {
		event: {
			...eventWithSortedLegs,
			runners
		},
		eventMap: await getEventMap(event.liveEvents[0], fetch),
		user: locals.user
	};
}
