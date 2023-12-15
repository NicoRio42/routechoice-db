import {
	createRoutechoiceStatistics,
	getRunnersWithTracksAndSortedLegs,
	parseRoutechoicesTracksInLegs,
	sortLegs
} from '$lib/helpers.js';
import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { detectRunnersRoutechoicesForASingleLeg } from '$lib/routechoice-detector.js';
import {
	leg as legFromDatabase,
	liveEvent as liveEventFromDatabase,
	routechoice as routechoiceFromDatabase,
	routechoiceStatistics as routechoiceStatisticsTable,
	runner as runnerFromDatabase,
	runnerLeg as runnerLegTable
} from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import { transform } from 'ol/proj.js';
import { getLineStringLength } from 'orienteering-js/utils';
import { superValidate } from 'sveltekit-superforms/server';
import { newRoutechoiceSchema } from './schema.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';

export const actions = {
	add: async ({ request, params: { eventId, legId }, locals, fetch }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const form = await superValidate(request, newRoutechoiceSchema);
		if (!form.valid) return fail(400, { form });

		const mercatorCoordinates = form.data.track.map((point) =>
			transform(point, 'EPSG:3857', 'EPSG:4326')
		);

		const latitudes = mercatorCoordinates.map((pt) => pt[1]).join(';');
		const longitudes = mercatorCoordinates.map((pt) => pt[0]).join(';');

		const length = getLineStringLength(mercatorCoordinates.map(([lat, lon]) => [lon, lat]));

		const routechoiceId = crypto.randomUUID();

		await locals.db
			.insert(routechoiceFromDatabase)
			.values({
				color: form.data.color,
				id: routechoiceId,
				length,
				name: form.data.name,
				fkLeg: legId,
				latitudes,
				longitudes
			})
			.run();

		await locals.db
			.insert(routechoiceStatisticsTable)
			.values({ fkRoutechoice: routechoiceId, id: crypto.randomUUID() })
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
			runners,
			fetch
		);

		const legIndex = sortedLegsWithRoutechoicesWithParsedTracks.findIndex(
			(leg) => leg.id === legId
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

			locals.db
				.update(runnerLegTable)
				.set({ fkDetectedRoutechoice })
				.where(eq(runnerLegTable.id, runnerLeg.id))
				.run();
		}

		const routechoicesStatistics = createRoutechoiceStatistics(
			runnersWithDetectedRoutechoices,
			legIndex
		);

		// TODO refactor routechoice statistics update

		locals.db
			.update(routechoiceStatisticsTable)
			.set({ bestTime: 0, numberOfRunners: 0 })
			.where(
				inArray(
					routechoiceStatisticsTable.fkRoutechoice,
					leg.routechoices.map((rc) => rc.id)
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
