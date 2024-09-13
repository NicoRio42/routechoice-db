import { ROUTES_COLORS } from '$lib/constants';
import { type LegInsert, type RoutechoiceInsert } from '$lib/server/db/models.js';
import type * as schema from '$lib/server/db/schema.js';
import {
	controlPoint as controlPointTable,
	leg as legTable,
	routechoice as routechoiceTable
} from '$lib/server/db/schema.js';
import type { ControlPoint, Leg as OrienteeringJsLeg } from '@orienteering-js/course';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { generateId } from 'lucia';

const ROUTECHOICE_NAMES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export async function insertControlPointsLegsAndRoutechoices(
	controlPoints: ControlPoint[],
	legs: OrienteeringJsLeg[],
	db: LibSQLDatabase<typeof schema>,
	eventId: string
): Promise<void> {
	const controlPointsToInsert = controlPoints.map((control) => ({
		fkEvent: eventId,
		code: control.code,
		latitude: control.lat,
		longitude: control.lon
	}));

	const insertedControlPoints = await db
		.insert(controlPointTable)
		.values(controlPointsToInsert)
		.returning();

	const legsToInsert: LegInsert[] = [];
	const routechoicesToInsert: RoutechoiceInsert[] = [];

	for (const lg of legs) {
		const startControl = insertedControlPoints.find((c) => c.code === lg.startControlCode);
		const finishControl = insertedControlPoints.find((c) => c.code === lg.finishControlCode);

		if (startControl === undefined || finishControl === undefined) {
			throw new Error('Control point not found');
		}

		const legId = generateId(15);

		legsToInsert.push({
			id: legId,
			fkEvent: eventId,
			fkStartControlPoint: startControl.id,
			fkFinishControlPoint: finishControl.id
		});

		lg.routechoices.forEach((rc, routechoiceIndex) => {
			const latitudes = rc.track.map((pt) => pt[0]).join(';');
			const longitudes = rc.track.map((pt) => pt[1]).join(';');

			routechoicesToInsert.push({
				color: ROUTES_COLORS[routechoiceIndex % ROUTES_COLORS.length],
				fkLeg: legId,
				latitudes,
				longitudes,
				length: rc.length,
				elevation: rc.elevation,
				name: ROUTECHOICE_NAMES[routechoiceIndex % ROUTECHOICE_NAMES.length]
			});
		});
	}

	if (legsToInsert.length > 0) {
		await db.insert(legTable).values(legsToInsert).run();
	}

	if (routechoicesToInsert.length > 0) {
		await db.insert(routechoiceTable).values(routechoicesToInsert).run();
	}
}
