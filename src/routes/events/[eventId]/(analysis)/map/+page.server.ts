import { db } from '$lib/server/db/db.js';
import {
	event as eventTable,
	leg as legTable,
	routechoice as routechoiceTable,
	runnerLeg as runnerLegTable,
	runner as runnerTable
} from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Coordinate } from 'ol/coordinate.js';
import { transform } from 'ol/proj.js';

export const actions = {
	updateRoutechoice: async ({ request, params: { eventId }, locals }) => {
		if (locals.user === null) throw error(401);

		const formData = await request.formData();
		const runnerId = formData.get('runnerId');
		if (typeof runnerId !== 'string') throw error(400);
		const runnerLegId = formData.get('runnerLegId');
		if (typeof runnerLegId !== 'string') throw error(400);
		const newRoutechoiceId = formData.get('routechoiceId');
		if (typeof newRoutechoiceId !== 'string') return error(400);
		const rawLegNumber = formData.get('legNumber');
		if (typeof rawLegNumber !== 'string') return error(400);
		const legNumber = parseInt(rawLegNumber, 10);
		if (isNaN(legNumber)) return error(400);

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

		throw redirect(302, `/events/${eventId}/map?legNumber=${legNumber}`);
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

const webMercatorToLatLon = (point: Coordinate) => transform(point, 'EPSG:3857', 'EPSG:4326');
