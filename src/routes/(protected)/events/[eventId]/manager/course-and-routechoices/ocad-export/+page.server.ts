import { fail, redirect } from '@sveltejs/kit';
import { parseIOFXML3CourseOCADExport, parseGPXRoutechoicesOCADExport } from 'orienteering-js/ocad';
import { DOMParser } from 'linkedom';
import { controlPoint, routechoice, leg } from '$lib/server/db/schema.js';

export const actions = {
	default: async ({ locals, request, params: { eventId } }) => {
		const formData = await request.formData();

		const courseFile = formData.get('courseFile');
		if (!(courseFile instanceof File)) return fail(400);

		const classIndexStr = formData.get('classIndex');
		if (classIndexStr === null) return fail(400);
		const classIndex = parseInt(classIndexStr.toString(), 10);
		if (isNaN(classIndex)) return fail(400);

		const routechoicesFile = formData.get('routechoicesFile');
		if (!(routechoicesFile instanceof File)) return fail(400);

		const eventIDInt = parseInt(eventId, 10);
		if (isNaN(eventIDInt)) return fail(400);

		try {
			const courseRaw = await courseFile.text();
			const parser = new DOMParser();
			const courseDoc = parser.parseFromString(courseRaw, 'text/xml');

			const [controls, legs] = parseIOFXML3CourseOCADExport(
				courseDoc as any as XMLDocument,
				classIndex
			);

			const routechoicesRaw = await routechoicesFile.text();
			const routechoicesDoc = parser.parseFromString(routechoicesRaw, 'text/xml');

			const legsWithRoutechoices = parseGPXRoutechoicesOCADExport(
				routechoicesDoc as any as XMLDocument,
				legs
			);

			await locals.db.transaction(async (tx) => {
				const controlPointsMap: Record<string, number> = {};

				controls.forEach(async (control) => {
					const { id } = await tx
						.insert(controlPoint)
						.values({
							code: control.code,
							latitude: control.lat,
							longitude: control.lon
						})
						.returning()
						.get();

					console.log(id);
					controlPointsMap[control.code] = id;
				});

				legsWithRoutechoices.forEach(async (lg) => {
					const fkStartControlPoint = controlPointsMap[lg.startControlCode];
					const fkFinishControlPoint = controlPointsMap[lg.finishControlCode];

					if (fkStartControlPoint === undefined || fkFinishControlPoint === undefined) {
						// console.log(lg);
						throw new Error('Control point not found');
					}

					const { id } = await tx
						.insert(leg)
						.values({
							fkEvent: eventIDInt,
							fkStartControlPoint,
							fkFinishControlPoint
						})
						.returning()
						.get();

					lg.routechoices.forEach(async (rc) => {
						const [latitudes, longitudes] = rc.track.reduce(
							(acc, current) => {
								return [`${acc[0]};${current[0]}`, `${acc[1]};${current[1]}`];
							},
							['', '']
						);

						await tx
							.insert(routechoice)
							.values({
								color: rc.color,
								latitudes,
								longitudes,
								length: rc.length,
								name: rc.name,
								fkLeg: id
							})
							.run();
					});
				});

				throw redirect(302, `/events/${eventId}/manager/split-times`);
			});
		} catch (e) {
			return fail(400);
		}
	}
};
