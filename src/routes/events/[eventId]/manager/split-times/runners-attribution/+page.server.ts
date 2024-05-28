import { GPS_PROVIDERS } from '$lib/constants.js';
import {
	createRoutechoiceStatistics,
	extractLiveProviderAndEventIdFromUrl,
	getCompetitorsFromLiveEvent,
	getRunnersWithTracksAndSortedLegs,
	parseRoutechoicesTracksInLegs,
	sortLegs
} from '$lib/helpers.js';
import { detectRunnersRoutechoices } from '$lib/routechoice-detector.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db, libsqlClient } from '$lib/server/db/db.js';
import {
	leg as legTable,
	liveEvent,
	liveEvent as liveEventTable,
	routechoiceStatistics as routechoiceStatisticsTable,
	runnerLeg as runnerLegTable,
	runner as runnerTable,
	user as userTable
} from '$lib/server/db/schema.js';
import type { InArgs, InStatement } from '@libsql/client';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { loggatorEventSchema } from 'orienteering-js/models';
import { matchRunnersByName } from './helpers.js';

export async function load({ params: { eventId }, locals, fetch }) {
	redirectIfNotAdmin(locals.user);

	const liveEvent = await db
		.select()
		.from(liveEventTable)
		.where(and(eq(liveEventTable.fkEvent, eventId), eq(liveEventTable.isPrimary, true)))
		.get();

	if (liveEvent === undefined) throw error(404);

	const users = (
		await db
			.select({ id: userTable.id, firstName: userTable.firstName, lastName: userTable.lastName })
			.from(userTable)
			.all()
	)
		.map((u) => ({ ...u, name: `${u.firstName} ${u.lastName}` }))
		.sort((a, b) => a.name.localeCompare(b.name));

	let competitors = await getCompetitorsFromLiveEvent(liveEvent, fetch);

	const runners = await db
		.select({
			id: runnerTable.id,
			firstName: runnerTable.firstName,
			lastName: runnerTable.lastName,
			userId: runnerTable.fkUser,
			liveEvent: runnerTable.fkLiveEvent,
			trackingDeviceId: runnerTable.trackingDeviceId
		})
		.from(runnerTable)
		.where(eq(runnerTable.fkEvent, eventId))
		.all();

	if (runners.every((r) => r.userId === null && r.trackingDeviceId === null)) {
		const runnersWithAttributedUsers = matchRunnersByName(
			runners.map((r) => ({
				id: r.id,
				firstName: r.firstName,
				lastName: r.lastName,
				userId: r.userId,
				trackingDeviceId: r.trackingDeviceId
			})),
			'userId',
			users.map((u) => ({ key: u.id, name: u.name }))
		);

		const runnersWithAttributedUsersAndCompetitors = matchRunnersByName(
			runnersWithAttributedUsers,
			'trackingDeviceId',
			competitors.map((c) => ({ key: c.deviceId, name: c.name }))
		);

		runners.forEach((runner) => {
			const attributedRunner = runnersWithAttributedUsersAndCompetitors.find(
				(r) => r.id === runner.id
			);

			if (attributedRunner === undefined) return;
			if (attributedRunner.userId !== null) runner.userId = attributedRunner.userId;
			if (attributedRunner.trackingDeviceId !== null) {
				runner.trackingDeviceId = attributedRunner.trackingDeviceId;
			}
		});
	}

	return { users, competitors, runners, liveEvent };
}

export const actions = {
	default: async ({ params: { eventId }, request, locals, fetch }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();

		const runnersFormData: Record<
			string,
			{ liveEvent: string | null; trackingDeviceId: string | null; userId: string | null }
		> = {};

		for (const [key, value] of formData.entries()) {
			if (value instanceof File) return fail(400);

			if (key.endsWith('-tracking')) {
				let liveEvent: string | null = null;
				let trackingDeviceId: string | null = null;

				if (value !== null && value !== undefined && value !== '')
					[liveEvent, trackingDeviceId] = value.split('|');

				const runnerId = key.replace('-tracking', '');

				if (runnersFormData[runnerId] === undefined) {
					runnersFormData[runnerId] = { liveEvent, trackingDeviceId, userId: null };
				} else {
					runnersFormData[runnerId] = { ...runnersFormData[runnerId], liveEvent, trackingDeviceId };
				}
			}

			if (key.endsWith('-user')) {
				const runnerId = key.replace('-user', '');
				const userId = value !== null && value !== undefined && value !== '' ? value : null;

				if (runnersFormData[runnerId] === undefined) {
					runnersFormData[runnerId] = { liveEvent: null, trackingDeviceId: null, userId };
				} else {
					runnersFormData[runnerId] = { ...runnersFormData[runnerId], userId };
				}
			}
		}

		for (const [runnerId, { trackingDeviceId, userId }] of Object.entries(runnersFormData)) {
			const runnersFormDataClone = { ...runnersFormData };
			delete runnersFormDataClone[runnerId];
			const runnersFormDataValues = Object.values(runnersFormDataClone);

			if (
				trackingDeviceId !== null &&
				runnersFormDataValues.some((r) => r.trackingDeviceId === trackingDeviceId)
			) {
				return fail(400, { error: { runnerId, code: 'SAME_TRACKING_DEVICE_ID' } } as const);
			}

			if (userId !== null && runnersFormDataValues.some((r) => r.userId === userId)) {
				return fail(400, { error: { runnerId, code: 'SAME_USER_ID' } } as const);
			}
		}

		const runners = await db.query.runner.findMany({
			where: eq(runnerTable.fkEvent, eventId),
			with: { legs: true }
		});

		const runnersWithLiveEventAndtrackingDeviceId = runners.map((runner) => {
			const runnerFormData = runnersFormData[runner.id];
			if (runnerFormData === undefined) return runner;
			const { liveEvent, trackingDeviceId, userId } = runnerFormData;

			return {
				...runner,
				fkLiveEvent: liveEvent,
				trackingDeviceId,
				fkUser: userId
			};
		});

		const liveEvents = await db
			.select()
			.from(liveEvent)
			.where(eq(liveEvent.fkEvent, eventId))
			.all();

		const legs = await db.query.leg.findMany({
			where: eq(legTable.fkEvent, eventId),
			with: { routechoices: true }
		});

		const sortedLegs = sortLegs(legs);
		const sortedLegsWithRoutechoicesWithParsedTracks = parseRoutechoicesTracksInLegs(sortedLegs);

		const runnersWithTracksAndSortedLegs = await getRunnersWithTracksAndSortedLegs(
			sortedLegs,
			liveEvents,
			runnersWithLiveEventAndtrackingDeviceId,
			fetch
		);

		const runnersWithDetectedRoutechoices = detectRunnersRoutechoices(
			sortedLegsWithRoutechoicesWithParsedTracks,
			runnersWithTracksAndSortedLegs
		);

		const routechoicesStatistics = createRoutechoiceStatistics(runnersWithDetectedRoutechoices);

		// Temporary fix to prevent usuing too many http sub requests
		// TODO use batch
		const statements: InStatement[] = [];

		for (const runner of runnersWithDetectedRoutechoices) {
			const { sql, params } = db
				.update(runnerTable)
				.set({
					fkLiveEvent: runner.fkLiveEvent,
					trackingDeviceId: runner.trackingDeviceId,
					fkUser: runner.fkUser
				})
				.where(eq(runnerTable.id, runner.id))
				.toSQL();

			statements.push({ sql, args: params as any as InArgs });

			for (const runnerLeg of runner.legs) {
				if (runnerLeg === null || !runnerLeg.fkDetectedRoutechoice) continue;

				const { sql, params } = db
					.update(runnerLegTable)
					.set({ fkDetectedRoutechoice: runnerLeg.fkDetectedRoutechoice })
					.where(eq(runnerLegTable.id, runnerLeg.id))
					.toSQL();

				statements.push({ sql, args: params as any as InArgs });
			}
		}

		for (const { bestTime, numberOfRunners, fkRoutechoice } of routechoicesStatistics) {
			const { sql, params } = db
				.update(routechoiceStatisticsTable)
				.set({ bestTime, numberOfRunners })
				.where(eq(routechoiceStatisticsTable.fkRoutechoice, fkRoutechoice))
				.toSQL();

			statements.push({ sql, args: params as any as InArgs });
		}

		await libsqlClient.batch(statements);

		throw redirect(302, `/events/${eventId}/map`);
	}
};
