import { getEventMap, getRunnersWithTracks } from '$lib/helpers.js';
import { event as eventTable, type ControlPoint } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Leg } from './models/leg.model.js';

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

	return {
		event: getRunnersWithTracks(event, fetch).then((e) => ({ ...e, legs: sortLegs(e.legs) })),
		eventMap: getEventMap(event.liveEvents[0], fetch),
		user
	};
}

function sortLegs(legs: Leg[]): Leg[] {
	const sortedLegs: Leg[] = [];

	const firstLeg = legs.find((leg) =>
		legs.every((otherLeg) => otherLeg.fkFinishControlPoint !== leg.fkStartControlPoint)
	);

	if (firstLeg === undefined) {
		throw new Error('Circular course');
	}

	sortedLegs.push(firstLeg);

	while (sortedLegs.length !== legs.length) {
		const nextLeg = legs.find(
			(leg) => leg.fkStartControlPoint === sortedLegs[sortedLegs.length - 1].fkFinishControlPoint
		);

		if (nextLeg === undefined) {
			throw new Error('There is holes in the course.');
		}

		sortedLegs.push(nextLeg);
	}

	return sortedLegs;
}
