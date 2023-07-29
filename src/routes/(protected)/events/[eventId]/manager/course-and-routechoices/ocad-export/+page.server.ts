import { fail, redirect } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';
import {
	controlPoint,
	routechoice,
	leg,
	routechoiceStatistics,
	type Leg,
	type Routechoice,
	type RoutechoiceStatistics
} from '$lib/server/db/schema.js';
import { parseIOFXML3CourseOCADExport, parseGPXRoutechoicesOCADExport } from 'orienteering-js/ocad';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';

export const actions = {
	default: async ({ locals, request, params: { eventId } }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const formData = await request.formData();

		const courseFile = formData.get('courseFile');
		if (!(courseFile instanceof File)) return fail(400);

		const classIndexStr = formData.get('classIndex');
		if (classIndexStr === null) return fail(400);
		const classIndex = parseInt(classIndexStr.toString(), 10);
		if (isNaN(classIndex)) return fail(400);

		const routechoicesFile = formData.get('routechoicesFile');
		if (!(routechoicesFile instanceof File)) return fail(400);

		const courseRaw = await courseFile.text();
		const parser = new DOMParser();
		const courseDoc = parser.parseFromString(courseRaw, 'text/xml');

		const [controls, legs] = parseIOFXML3CourseOCADExport(
			courseDoc as any as XMLDocument,
			classIndex
		);

		const legsMap: Record<string, [string, string]> = {};

		legs.forEach((leg) => {
			const startControl = controls.find((c) => c.code === leg.startControlCode);
			const finishControl = controls.find((c) => c.code === leg.finishControlCode);

			if (startControl === undefined || finishControl === undefined)
				throw new Error('Control point not found');

			legsMap[leg.id] = [startControl.id, finishControl.id];
		});

		const routechoicesRaw = await routechoicesFile.text();
		const routechoicesDoc = parser.parseFromString(routechoicesRaw, 'text/xml');

		const legsWithRoutechoices = parseGPXRoutechoicesOCADExport(
			routechoicesDoc as any as XMLDocument,
			legs
		);

		await locals.db.transaction(async (tx) => {
			const controlPointsToInsert = controls.map((control) => ({
				id: control.id,
				fkEvent: eventId,
				code: control.code,
				latitude: control.lat,
				longitude: control.lon
			}));

			await tx.insert(controlPoint).values(controlPointsToInsert).run();

			const legsToInsert: Leg[] = [];
			const routechoicesToInsert: Routechoice[] = [];
			const routechoicesStatisticsToInsert: Omit<
				RoutechoiceStatistics,
				'numberOfRunners' | 'bestTime'
			>[] = [];

			for (const lg of legsWithRoutechoices) {
				const [fkStartControlPoint, fkFinishControlPoint] = legsMap[lg.id];

				if (fkStartControlPoint === undefined || fkFinishControlPoint === undefined) {
					throw new Error('Control point not found');
				}

				legsToInsert.push({
					id: lg.id,
					fkEvent: eventId,
					fkFinishControlPoint,
					fkStartControlPoint
				});

				for (const rc of lg.routechoices) {
					const latitudes = rc.track.map((pt) => pt[0]).join(';');
					const longitudes = rc.track.map((pt) => pt[1]).join(';');

					routechoicesToInsert.push({
						color: rc.color,
						fkLeg: lg.id,
						id: rc.id,
						latitudes,
						longitudes,
						length: rc.length,
						name: rc.name
					});

					routechoicesStatisticsToInsert.push({ id: crypto.randomUUID(), fkRoutechoice: rc.id });
				}
			}

			await tx.insert(leg).values(legsToInsert).run();
			await tx.insert(routechoice).values(routechoicesToInsert).run();
			await tx.insert(routechoiceStatistics).values(routechoicesStatisticsToInsert).run();

			throw redirect(302, `/events/${eventId}/manager/split-times`);
		});
	}
};
