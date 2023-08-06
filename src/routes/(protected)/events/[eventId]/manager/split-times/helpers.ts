import type * as schema from '$lib/server/db/schema.js';
import {
    controlPoint,
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
            controlPoint: { id: controlPoint.id, code: controlPoint.code }
        })
        .from(leg)
        .innerJoin(
            controlPoint,
            or(
                eq(leg.fkStartControlPoint, controlPoint.id),
                eq(leg.fkFinishControlPoint, controlPoint.id)
            )
        )
        .where(eq(leg.fkEvent, eventId))
        .all();

    const legs: { id: string; startControlPointCode: string; finishControlPointCode: string }[] =
        [];

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

    await db.transaction(async (tx) => {
        runners.forEach(async (runner) => {
            await tx
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

            runner.legs.forEach(async (runnerLeg) => {
                if (runnerLeg === null) return;

                let leg = legs.find(
                    (l) =>
                        l.startControlPointCode === runnerLeg.startControlCode &&
                        l.finishControlPointCode === runnerLeg.finishControlCode
                );

                // Maybe last leg
                if (leg === undefined)
                    leg = legs.find((l) => l.startControlPointCode === runnerLeg.startControlCode);

                // Maybe first leg
                if (leg === undefined)
                    leg = legs.find((l) => l.finishControlPointCode === runnerLeg.finishControlCode);

                if (leg === undefined) {
                    console.error(
                        `Cannot find a leg in the database for runner ${runner.firstName} ${runner.lastName} start control code ${runnerLeg.startControlCode} finish control code ${runnerLeg.finishControlCode}`
                    );
                    return;
                }

                await tx
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
            });
        });
    });
}