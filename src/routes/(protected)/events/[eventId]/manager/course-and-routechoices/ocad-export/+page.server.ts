import { fail, redirect } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';
import { controlPoint, routechoice, leg } from '$lib/server/db/schema.js';
import { parseIOFXML3CourseOCADExport, parseGPXRoutechoicesOCADExport } from 'orienteering-js/ocad';

export const actions = {
	default: async ({ locals, request, params: { eventId } }) => {
		const { user } = await locals.authRequest.validateUser();
		if (!user) throw redirect(302, '/login');
		if (user.emailVerified === 0) throw redirect(302, '/email-verification');

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
			controls.forEach(async (control) => {
				await tx
					.insert(controlPoint)
					.values({
						id: control.id,
						fkEvent: eventId,
						code: control.code,
						latitude: control.lat,
						longitude: control.lon
					})
					.returning()
					.get();
			});

			legsWithRoutechoices.forEach(async (lg) => {
				const [fkStartControlPoint, fkFinishControlPoint] = legsMap[lg.id];

				if (fkStartControlPoint === undefined || fkFinishControlPoint === undefined) {
					throw new Error('Control point not found');
				}

				await tx
					.insert(leg)
					.values({ id: lg.id, fkEvent: eventId, fkFinishControlPoint, fkStartControlPoint })
					.run();

				lg.routechoices.forEach(async (rc) => {
					const latitudes = rc.track.map((pt) => pt[0]).join(';');
					const longitudes = rc.track.map((pt) => pt[1]).join(';');

					await tx
						.insert(routechoice)
						.values({
							color: rc.color,
							fkLeg: lg.id,
							id: rc.id,
							latitudes,
							longitudes,
							length: rc.length,
							name: rc.name
						})
						.run();
				});
			});

			throw redirect(302, `/events/${eventId}/manager/split-times`);
		});
	}
};
