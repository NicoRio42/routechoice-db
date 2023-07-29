import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import {
	controlPoint,
	leg,
	runnerLeg as runnerLegTable,
	runner as runnerTable
} from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, or } from 'drizzle-orm';
import { DOMParser } from 'linkedom';
import type { Runner } from 'orienteering-js/models';
import { parseIOFXML3SplitTimesFile } from 'orienteering-js/split-times';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { splitTimesFromLocalFile } from './schema.js';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const form = await superValidate(splitTimesFromLocalFile);
	return { form };
}

export const actions = {
	default: async ({ locals, params: { eventId }, request }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const formData = await request.formData();
		const form = await superValidate(formData, splitTimesFromLocalFile);
		if (!form.valid) return fail(400, { form });

		const splitTimesFile = formData.get('file');
		if (!(splitTimesFile instanceof File)) return setError(form, 'file', 'Not a valid file');

		const splitTimesRaw = await splitTimesFile.text();
		const parser = new DOMParser();
		const splitTimesDoc = parser.parseFromString(splitTimesRaw, 'text/xml');

		let runners: Runner[];

		try {
			runners = parseIOFXML3SplitTimesFile(
				splitTimesDoc as any as XMLDocument,
				form.data.className,
				form.data.timezone
			);
		} catch (e) {
			return setError(form, null, `Problem with split times parsing: ${e}`);
		}

		const rawLegs = await locals.db
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

		await locals.db.transaction(async (tx) => {
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

				runner.legs.forEach(async (runnerLeg, legIndex) => {
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

			throw redirect(302, `/events/${eventId}/manager/split-times/runners-attribution`);
		});
	}
};
