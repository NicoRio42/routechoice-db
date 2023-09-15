import type * as schema from '$lib/server/db/schema.js';
import type { Runner, RunnerLeg } from '$lib/server/db/schema.js';
import {
	controlPoint as controlPointTable,
	event as eventTable,
	leg,
	runnerLeg as runnerLegTable,
	runner as runnerTable
} from '$lib/server/db/schema.js';
import { eq, or } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DOMParser } from 'linkedom';
import { parseIofXmlSplitTimesFile } from 'orienteering-js/split-times';

export async function parseAndInsertSplitTimesFromIofXml3File(
	splitTimesRaw: string,
	classNameOrId: string,
	timezone: string,
	eventId: string,
	db: LibSQLDatabase<typeof schema>
) {
	const parser = new DOMParser();
	const splitTimesDoc = parser.parseFromString(splitTimesRaw, 'text/xml');
	const event = await db.select().from(eventTable).where(eq(eventTable.id, eventId)).get();

	const [runners, runnersError] = parseIofXmlSplitTimesFile(
		splitTimesDoc as any as XMLDocument,
		classNameOrId,
		timezone,
		event.publishTime.toISOString().split('T')[0]
	);

	if (runnersError !== null) {
		return runnersError;
	}

	const rawLegs = await db
		.select({
			id: leg.id,
			startControlPointId: leg.fkStartControlPoint,
			finishControlPointId: leg.fkFinishControlPoint,
			controlPoint: { id: controlPointTable.id, code: controlPointTable.code }
		})
		.from(leg)
		.innerJoin(
			controlPointTable,
			or(
				eq(leg.fkStartControlPoint, controlPointTable.id),
				eq(leg.fkFinishControlPoint, controlPointTable.id)
			)
		)
		.where(eq(leg.fkEvent, eventId))
		.all();

	const legs: { id: string; startControlPointCode: string; finishControlPointCode: string }[] = [];

	rawLegs.forEach((rawLeg) => {
		const isStart = rawLeg.startControlPointId === rawLeg.controlPoint?.id;
		const foundLeg = legs.find((l) => l.id === rawLeg.id);

		if (foundLeg !== undefined) {
			if (isStart) foundLeg.startControlPointCode = rawLeg.controlPoint.code;
			else foundLeg.finishControlPointCode = rawLeg.controlPoint.code;
			return;
		}

		if (isStart)
			legs.push({
				id: rawLeg.id,
				startControlPointCode: rawLeg.controlPoint.code,
				finishControlPointCode: ''
			});
		else
			legs.push({
				id: rawLeg.id,
				startControlPointCode: '',
				finishControlPointCode: rawLeg.controlPoint.code
			});
	});

	const runnersToInsert: Omit<Runner, 'fkUser' | 'fkLiveEvent' | 'trackingDeviceId'>[] = [];
	const runnersLegsToInsert: Omit<RunnerLeg, 'fkDetectedRoutechoice' | 'fkManualRoutechoice'>[] =
		[];

	for (const runner of runners) {
		runnersToInsert.push({
			id: runner.id,
			firstName: runner.firstName,
			lastName: runner.lastName,
			fkEvent: eventId,
			startTime: new Date(runner.startTime * 1000),
			status: runner.status,
			rank: runner.rank,
			time: runner.time,
			timeBehind: runner.timeBehind,
			timeOffset: runner.timeOffset,
			totalTimeLost: runner.totalTimeLost
		});

		for (let runnerLegIndex = 0; runnerLegIndex < runner.legs.length; runnerLegIndex++) {
			const runnerLeg = runner.legs[runnerLegIndex];

			if (runnerLeg === null) continue;
			const leg = legs[runnerLegIndex];

			runnersLegsToInsert.push({
				id: crypto.randomUUID(),
				fkRunner: runner.id,
				fkLeg: leg.id,
				timeOverall: runnerLeg.timeOverall,
				time: runnerLeg.time,
				rankSplit: runnerLeg.rankSplit,
				timeBehindSplit: runnerLeg.timeBehindSplit,
				rankOverall: runnerLeg.rankOverall,
				timeBehindOverall: runnerLeg.timeBehindOverall,
				timeBehindSuperman: runnerLeg.timeBehindSuperman,
				timeLoss: runnerLeg.timeLoss,
				routechoiceTimeLoss: 0
			});
		}
	}

	await db.insert(runnerTable).values(runnersToInsert).run();
	await db.insert(runnerLegTable).values(runnersLegsToInsert).run();
}
