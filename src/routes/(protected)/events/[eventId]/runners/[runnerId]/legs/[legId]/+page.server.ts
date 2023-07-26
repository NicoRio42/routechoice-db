import {
	createRoutechoiceStatistics,
	getRunnersWithTracksAndSortedLegs,
	parseRoutechoicesTracksInLegs,
	sortLegs
} from '$lib/helpers.js';
import {
	leg as legFromDatabase,
	liveEvent as liveEventFromDatabase,
	routechoiceStatistics as routechoiceStatisticsTable,
	runner as runnerFromDatabase,
	runnerLeg as runnerLegFromDatabase
} from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';

export const actions = {
	updateRoutechoice: async ({
		request,
		params: { eventId, runnerId, legId: runnerLegId },
		locals
	}) => {
		const { user } = await locals.authRequest.validateUser();

		if (user === null) {
			return fail(403);
		}

		const runner = await locals.db
			.select()
			.from(runnerFromDatabase)
			.where(eq(runnerFromDatabase.id, runnerId))
			.get();

		const runnerLeg = await locals.db
			.select()
			.from(runnerLegFromDatabase)
			.where(eq(runnerLegFromDatabase.id, runnerLegId))
			.get();

		if (runnerLeg.fkRunner !== runnerId) {
			return fail(400);
		}

		if (runner.fkUser !== user.id && user.role !== 'admin') {
			return fail(403);
		}

		const formData = await request.formData();
		const newRoutechoiceId = formData.get('routechoiceId');

		if (newRoutechoiceId === null || newRoutechoiceId instanceof File) {
			return fail(400);
		}

		await locals.db
			.update(runnerLegFromDatabase)
			.set({ fkManualRoutechoice: newRoutechoiceId })
			.where(eq(runnerLegFromDatabase.id, runnerLegId))
			.run();

		const runners = await locals.db.query.runner.findMany({
			where: eq(runnerFromDatabase.fkEvent, eventId),
			with: { legs: true }
		});

		const liveEvents = await locals.db
			.select()
			.from(liveEventFromDatabase)
			.where(eq(liveEventFromDatabase.fkEvent, eventId))
			.all();

		const legs = await locals.db.query.leg.findMany({
			where: eq(legFromDatabase.fkEvent, eventId),
			with: { routechoices: true }
		});

		const sortedLegs = sortLegs(legs);
		const sortedLegsWithRoutechoicesWithParsedTracks = parseRoutechoicesTracksInLegs(sortedLegs);

		const runnersWithTracksAndSortedLegs = await getRunnersWithTracksAndSortedLegs(
			sortedLegs,
			liveEvents,
			runners
		);

		const legIndex = sortedLegsWithRoutechoicesWithParsedTracks.findIndex(
			(leg) => leg.id === runnerLeg.fkLeg
		);

		if (legIndex === -1) {
			return fail(400);
		}

		const routechoicesStatistics = createRoutechoiceStatistics(
			runnersWithTracksAndSortedLegs,
			legIndex
		);

		// TODO refactor routechoice statistics update

		locals.db
			.update(routechoiceStatisticsTable)
			.set({ bestTime: 0, numberOfRunners: 0 })
			.where(
				inArray(
					routechoiceStatisticsTable.fkRoutechoice,
					legs.flatMap((leg) => leg.routechoices.map((rc) => rc.id))
				)
			)
			.run();

		for (const { bestTime, numberOfRunners, fkRoutechoice } of routechoicesStatistics) {
			await locals.db
				.update(routechoiceStatisticsTable)
				.set({ bestTime, numberOfRunners })
				.where(eq(routechoiceStatisticsTable.fkRoutechoice, fkRoutechoice))
				.run();
		}

		throw redirect(302, `/events/${eventId}?legNumber=${legIndex + 1}`);
	}
};
