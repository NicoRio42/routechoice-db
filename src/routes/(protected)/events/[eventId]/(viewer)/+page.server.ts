import { getEventMap, getTracksFromLiveEvents } from '$lib/helpers.js';
import { event as eventTable, type RunnerLeg } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Leg } from './models/leg.model.js';
import type { Runner } from './models/runner.model.js';

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

	const runnersWithTracks = await getTracksFromLiveEvents(eventWithSortedLegs.liveEvents, fetch)
		.then((tracks) =>
			eventWithSortedLegs.runners.map((runner) => {
				const track = tracks.find(
					(t) =>
						t.trackingDeviceId === runner.trackingDeviceId && t.fkLiveEvent === runner.fkLiveEvent
				);

				return { ...runner, track: track === undefined ? null : track.track };
			})
		)
		.then((runners) => sortRunnersLegs(runners, eventWithSortedLegs.legs));

	return {
		event: { ...eventWithSortedLegs, runners: runnersWithTracks },
		eventMap: getEventMap(event.liveEvents[0], fetch),
		user
	};
}

function sortRunnersLegs(runners: Runner[], legs: Leg[]): Runner[] {
	return runners.map((runner) => {
		const runnerLegs: (RunnerLeg | null)[] = [];

		legs.forEach((leg) => {
			const runnerLeg = runner.legs.find((l) => leg.id === l?.fkLeg);
			if (runnerLeg === undefined) runnerLegs.push(null);
			else runnerLegs.push(runnerLeg);
		});

		return { ...runner, legs: runnerLegs };
	});
}

function sortLegs(legs: Leg[]): Leg[] {
	if (legs.length === 0) return [];
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
