import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { Control, Leg as OrienteeringJsLeg } from 'orienteering-js/models';
import type * as schema from '$lib/server/db/schema.js';
import {
	controlPoint as controlPointTable,
	routechoice as routechoiceTable,
	leg as legTable,
	routechoiceStatistics as routechoiceStatisticsTable,
	type Leg,
	type Routechoice,
	type RoutechoiceStatistics
} from '$lib/server/db/schema.js';

export async function insertControlPointsLegsRoutechoicesAndRoutechoicesStatistics(
	controlPoints: Control[],
	legs: OrienteeringJsLeg[],
	db: LibSQLDatabase<typeof schema>,
	eventId: string
): Promise<void> {
	const legsMap: Record<string, [string, string]> = {};

	legs.forEach((leg) => {
		const startControl = controlPoints.find((c) => c.code === leg.startControlCode);
		const finishControl = controlPoints.find((c) => c.code === leg.finishControlCode);

		if (startControl === undefined || finishControl === undefined)
			throw new Error('Control point not found');

		legsMap[leg.id] = [startControl.id, finishControl.id];
	});

	const controlPointsToInsert = controlPoints.map((control) => ({
		id: control.id,
		fkEvent: eventId,
		code: control.code,
		latitude: control.lat,
		longitude: control.lon
	}));

	await db.insert(controlPointTable).values(controlPointsToInsert).run();

	const legsToInsert: Leg[] = [];
	const routechoicesToInsert: Routechoice[] = [];
	const routechoicesStatisticsToInsert: Omit<
		RoutechoiceStatistics,
		'numberOfRunners' | 'bestTime'
	>[] = [];

	for (const lg of legs) {
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

	await db.insert(legTable).values(legsToInsert).run();
	await db.insert(routechoiceTable).values(routechoicesToInsert).run();
	await db.insert(routechoiceStatisticsTable).values(routechoicesStatisticsToInsert).run();
}
