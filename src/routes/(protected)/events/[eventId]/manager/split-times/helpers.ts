import type * as schema from '$lib/server/db/schema.js';
import {
	controlPoint as controlPointTable,
	leg,
	runnerLeg as runnerLegTable,
	runner as runnerTable
} from '$lib/server/db/schema.js';
import { eq, or } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DOMParser } from 'linkedom';
import { parseIOFXML3SplitTimesFile } from 'orienteering-js/split-times';

export async function parseAndInsertSplitTimesFromIofXml3File(
	splitTimesRaw: string,
	classNameOrId: string,
	timezone: string,
	eventId: string,
	db: LibSQLDatabase<typeof schema>
) {
	const parser = new DOMParser();
	const splitTimesDoc = parser.parseFromString(splitTimesRaw, 'text/xml');

	const runners = parseIOFXML3SplitTimesFile(
		splitTimesDoc as any as XMLDocument,
		classNameOrId,
		timezone
	);

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

	let runnerIndex = 0;

	for (const runner of runners) {
		await db
			.insert(runnerTable)
			.values({
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
			})
			.run();

		if (runner.legs.length !== legs.length) {
			throw new Error(
				`Runner ${runner.firstName} ${runner.lastName} doesn't have same numbre of legs than the course.`
			);
		}

		let runnerLegIndex = 0;

		for (const runnerLeg of runner.legs) {
			if (runnerLeg === null) return;
			const leg = legs[runnerLegIndex];

			if (runnerIndex === 0) console.log(runnerLeg.time);

			await db
				.insert(runnerLegTable)
				.values({
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
				})
				.run();

			runnerLegIndex++;
		}

		runnerIndex++;
	}
}
