import { assignRunnerTracksFromLiveEvent } from '$lib/helpers.js';
import {
	event as eventTable,
	liveEvent as liveEventTable,
	runnerLeg as runnerLegTable,
	runner as runnerTable
} from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ params: { eventId }, locals, fetch }) => {
	const event = await locals.db.query.event.findFirst({
		where: eq(eventTable.id, eventId),
		with: {
			liveEvents: true,
			runners: { with: { legs: true } },
			legs: { with: { routechoices: true } },
			controlPoints: true
		}
	});

	// TODO might be fixed in next version of Drizzle
	assignRunnerTracksFromLiveEvent(event as any, fetch);

	return { event };

	// const rawEvent = await locals.db
	// 	.select({
	// 		name: eventTable.name,
	// 		liveEvent: {
	// 			provider: liveEventTable.liveProvider,
	// 			url: liveEventTable.url
	// 		}
	// 	})
	// 	.from(eventTable)
	// 	.where(eq(eventTable.id, eventId))
	// 	.innerJoin(liveEventTable, eq(liveEventTable.fkEvent, eventTable.id))
	// 	.all();

	// if (rawEvent.length === 0) throw error(500, 'No live provider for this event');

	// type RawEvent = (typeof rawEvent)[number];
	// type EventFromDB = Omit<RawEvent, 'liveEvent'> & { liveEvents: RawEvent['liveEvent'][] };

	// const firstRawEvent = rawEvent[0];
	// const event: EventFromDB = { name: firstRawEvent.name, liveEvents: [] };
	// rawEvent.forEach((e) => event.liveEvents.push(e.liveEvent));

	// const runners = await locals.db
	// 	.select({
	// 		firstName: runnerTable.firstName,
	// 		leg:
	// 	})
	// 	.from(runnerTable)
	// 	.where(eq(runnerTable.fkEvent, eventId))
	// 	.leftJoin(runnerLegTable, eq(runnerLegTable.fkRunner, runnerTable.id))
	// 	.all();

	// console.log(event, runners);
};
