import {
	getRunnersWithTracksAndSortedLegs,
	parseRoutechoicesTracksInLegs,
	sortLegsAndRoutechoices
} from '$lib/helpers.js';
import { detectRunnersRoutechoicesForASingleLeg } from '$lib/routechoice-detector.js';
import { db } from '$lib/server/db/db.js';
import {
	event as eventTable,
	leg as legTable,
	liveEvent as liveEventFromDatabase,
	routechoice as routechoiceTable,
	runnerLeg as runnerLegTable,
	runner as runnerTable
} from '$lib/server/db/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { transform } from 'ol/proj.js';
import { getLineStringLength } from 'orienteering-js/utils';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newRoutechoiceSchema } from './routechoice.schema.js';

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

		const runners = await db.query.runner.findMany({
			where: eq(runnerTable.fkEvent, eventId),
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

		const sortedLegs = sortLegsAndRoutechoices(legs);
		const sortedLegsWithRoutechoicesWithParsedTracks = parseRoutechoicesTracksInLegs(sortedLegs);

		const runnersWithTracksAndSortedLegs = await getRunnersWithTracksAndSortedLegs(
			sortedLegs,
			liveEvents,
			runners,
			{ fetch }
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

		throw redirect(302, `/events/${eventId}/map?legNumber=${legIndex + 1}`);
	},
	updateRoutechoice: async ({ request, params: { eventId }, locals }) => {
		if (locals.user === null) throw error(401);

		const formData = await request.formData();
		const runnerId = formData.get('runnerId');
		if (typeof runnerId !== 'string') throw error(400);
		const runnerLegId = formData.get('runnerLegId');
		if (typeof runnerLegId !== 'string') throw error(400);
		const newRoutechoiceId = formData.get('routechoiceId');
		if (typeof newRoutechoiceId !== 'string') return error(400);

		const queryResult = await db
			.select()
			.from(runnerLegTable)
			.innerJoin(runnerTable, eq(runnerTable.id, runnerLegTable.fkRunner))
			.where(and(eq(runnerLegTable.id, runnerLegId), eq(runnerTable.id, runnerId)))
			.get();

		if (queryResult === undefined) throw error(404);
		const { runner_leg: runnerLeg, runner } = queryResult;
		if (runnerLeg.fkRunner !== runnerId) return error(400);

		if (runner.fkUser !== locals.user.id && locals.user.role !== 'admin') {
			return error(403);
		}

		await db
			.update(runnerLegTable)
			.set({ fkManualRoutechoice: newRoutechoiceId })
			.where(eq(runnerLegTable.id, runnerLegId))
			.run();

		const legs = await db.query.leg.findMany({
			where: eq(legTable.fkEvent, eventId),
			with: { routechoices: true }
		});

		const sortedLegs = sortLegsAndRoutechoices(legs);

		const legIndex = sortedLegs.findIndex((leg) => leg.id === runnerLeg.fkLeg);

		if (legIndex === -1) {
			return error(400);
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
