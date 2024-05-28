import {
	createRoutechoiceStatistics,
	getRunnersWithTracksAndSortedLegs,
	parseRoutechoicesTracksInLegs,
	sortLegs
} from '$lib/helpers.js';
import { db } from '$lib/server/db/db.js';
import {
	leg as legTable,
	event as eventTable,
	liveEvent as liveEventFromDatabase,
	routechoiceStatistics as routechoiceStatisticsTable,
	runner as runnerFromDatabase,
	runnerLeg as runnerLegFromDatabase,
	routechoice as routechoiceTable,
	runnerLeg as runnerLegTable
} from '$lib/server/db/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { newRoutechoiceSchema } from './routechoice.schema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { transform } from 'ol/proj.js';
import { getLineStringLength } from 'orienteering-js/utils';
import { detectRunnersRoutechoicesForASingleLeg } from '$lib/routechoice-detector.js';

export const actions = {
	addRoutechoice: async ({ request, params: { eventId }, locals, fetch }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const form = await superValidate(request, zod(newRoutechoiceSchema));
		if (!form.valid) return fail(400, { form });

		const mercatorCoordinates = form.data.track.map((point) =>
			transform(point, 'EPSG:3857', 'EPSG:4326')
		);

		const latitudes = mercatorCoordinates.map((pt) => pt[1]).join(';');
		const longitudes = mercatorCoordinates.map((pt) => pt[0]).join(';');

		const length = getLineStringLength(mercatorCoordinates.map(([lat, lon]) => [lon, lat]));

		const routechoiceId = crypto.randomUUID();

		await db
			.insert(routechoiceTable)
			.values({
				color: form.data.color,
				id: routechoiceId,
				length,
				name: form.data.name,
				fkLeg: form.data.legId,
				latitudes,
				longitudes
			})
			.run();

		await db
			.insert(routechoiceStatisticsTable)
			.values({ fkRoutechoice: routechoiceId, id: crypto.randomUUID() })
			.run();

		const runners = await db.query.runner.findMany({
			where: eq(runnerFromDatabase.fkEvent, eventId),
			with: { legs: true }
		});

		const liveEvents = await db
			.select()
			.from(liveEventFromDatabase)
			.where(eq(liveEventFromDatabase.fkEvent, eventId))
			.all();

		const legs = await db.query.leg.findMany({
			where: eq(legTable.fkEvent, eventId),
			with: { routechoices: true }
		});

		const sortedLegs = sortLegs(legs);
		const sortedLegsWithRoutechoicesWithParsedTracks = parseRoutechoicesTracksInLegs(sortedLegs);

		const runnersWithTracksAndSortedLegs = await getRunnersWithTracksAndSortedLegs(
			sortedLegs,
			liveEvents,
			runners,
			fetch
		);

		const legIndex = sortedLegsWithRoutechoicesWithParsedTracks.findIndex(
			(leg) => leg.id === form.data.legId
		);

		if (legIndex === -1) {
			return fail(400);
		}

		const leg = sortedLegsWithRoutechoicesWithParsedTracks[legIndex];

		const runnersWithDetectedRoutechoices = detectRunnersRoutechoicesForASingleLeg(
			leg,
			runnersWithTracksAndSortedLegs,
			legIndex
		);

		for (const runner of runnersWithDetectedRoutechoices) {
			const runnerLeg = runner.legs[legIndex];
			if (runnerLeg === null) continue;

			const fkDetectedRoutechoice = runnerLeg.fkDetectedRoutechoice;

			db.update(runnerLegTable)
				.set({ fkDetectedRoutechoice })
				.where(eq(runnerLegTable.id, runnerLeg.id))
				.run();
		}

		const routechoicesStatistics = createRoutechoiceStatistics(
			runnersWithDetectedRoutechoices,
			legIndex
		);

		// TODO refactor routechoice statistics update

		db.update(routechoiceStatisticsTable)
			.set({ bestTime: 0, numberOfRunners: 0 })
			.where(
				inArray(
					routechoiceStatisticsTable.fkRoutechoice,
					leg.routechoices.map((rc) => rc.id)
				)
			)
			.run();

		for (const { bestTime, numberOfRunners, fkRoutechoice } of routechoicesStatistics) {
			await db
				.update(routechoiceStatisticsTable)
				.set({ bestTime, numberOfRunners })
				.where(eq(routechoiceStatisticsTable.fkRoutechoice, fkRoutechoice))
				.run();
		}

		throw redirect(302, `/events/${eventId}/map?legNumber=${legIndex + 1}`);
	},
	updateRoutechoice: async ({ request, params: { eventId }, locals, fetch }) => {
		const formData = await request.formData();
		const runnerId = formData.get('runnerId');
		if (typeof runnerId !== 'string') throw error(400);
		const runnerLegId = formData.get('runnerLegId');
		if (typeof runnerLegId !== 'string') throw error(400);

		const runner = await db
			.select()
			.from(runnerFromDatabase)
			.where(eq(runnerFromDatabase.id, runnerId))
			.get();

		if (runner === undefined) throw error(404);

		const runnerLeg = await db
			.select()
			.from(runnerLegFromDatabase)
			.where(eq(runnerLegFromDatabase.id, runnerLegId))
			.get();

		if (runnerLeg === undefined) throw error(404);

		if (runnerLeg.fkRunner !== runnerId) {
			return fail(400);
		}

		if (runner.fkUser !== locals.user?.id && locals.user?.role !== 'admin') {
			return fail(403);
		}

		const newRoutechoiceId = formData.get('routechoiceId');

		if (newRoutechoiceId === null || newRoutechoiceId instanceof File) {
			return fail(400);
		}

		await db
			.update(runnerLegFromDatabase)
			.set({ fkManualRoutechoice: newRoutechoiceId })
			.where(eq(runnerLegFromDatabase.id, runnerLegId))
			.run();

		const runners = await db.query.runner.findMany({
			where: eq(runnerFromDatabase.fkEvent, eventId),
			with: { legs: true }
		});

		const liveEvents = await db
			.select()
			.from(liveEventFromDatabase)
			.where(eq(liveEventFromDatabase.fkEvent, eventId))
			.all();

		const legs = await db.query.leg.findMany({
			where: eq(legTable.fkEvent, eventId),
			with: { routechoices: true }
		});

		const sortedLegs = sortLegs(legs);
		const sortedLegsWithRoutechoicesWithParsedTracks = parseRoutechoicesTracksInLegs(sortedLegs);

		const runnersWithTracksAndSortedLegs = await getRunnersWithTracksAndSortedLegs(
			sortedLegs,
			liveEvents,
			runners,
			fetch
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

		const legRoutechoicesIds = legs
			.filter((_, index) => index === legIndex)
			.flatMap((leg) => leg.routechoices.map((rc) => rc.id));

		db.update(routechoiceStatisticsTable)
			.set({ bestTime: 0, numberOfRunners: 0 })
			.where(inArray(routechoiceStatisticsTable.fkRoutechoice, legRoutechoicesIds))
			.run();

		for (const { bestTime, numberOfRunners, fkRoutechoice } of routechoicesStatistics) {
			await db
				.update(routechoiceStatisticsTable)
				.set({ bestTime, numberOfRunners })
				.where(eq(routechoiceStatisticsTable.fkRoutechoice, fkRoutechoice))
				.run();
		}

		throw redirect(302, `/events/${eventId}/map?legNumber=${legIndex + 1}`);
	},
	deleteRoutechoice: async ({ locals, params: { eventId }, request }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();
		const legId = formData.get('legId');
		if (typeof legId !== 'string') throw error(400);
		const routechoiceId = formData.get('routechoiceId');
		if (typeof routechoiceId !== 'string') throw error(400);

		const routechoice = await db
			.select()
			.from(routechoiceTable)
			.innerJoin(legTable, eq(routechoiceTable.fkLeg, legTable.id))
			.innerJoin(eventTable, eq(legTable.fkEvent, eventTable.id))
			.where(
				and(
					eq(routechoiceTable.id, routechoiceId),
					eq(legTable.id, legId),
					eq(eventTable.id, eventId)
				)
			)
			.run();

		if (routechoice === undefined) {
			throw error(400, "Routechoice doesn't belong to the given leg and event.");
		}

		await db.delete(routechoiceTable).where(eq(routechoiceTable.id, routechoiceId)).run();

		redirect(302, `/events/${eventId}/map`);
	}
};
