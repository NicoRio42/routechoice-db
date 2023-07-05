import { GPS_PROVIDERS } from '$lib/constants.js';
import { extractLiveProviderAndEventIdFromUrl, getTracksFromLiveEvents } from '$lib/helpers.js';
import {
	runner as runnerTable,
	user,
	liveEvent as liveEventTable,
	liveEvent,
	leg as legTable,
	controlPoint as controlPointTable
} from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { loggatorEventSchema } from 'orienteering-js/models';
import { matchRunnersByName } from './helpers.js';
import {
	detectRunnersRoutechoices,
	detectSingleRunnerRoutechoices
} from 'orienteering-js/routechoice-detector';

export async function load({ params: { eventId }, locals, fetch }) {
	const liveEvent = locals.db
		.select()
		.from(liveEventTable)
		.where(and(eq(liveEventTable.fkEvent, eventId), eq(liveEventTable.isPrimary, true)))
		.get();

	const users = locals.db.select({ id: user.id, name: user.name }).from(user).all();

	let competitors: {
		deviceId: number;
		name: string;
	}[];

	const [provider, liveEventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);
	const gpsProvider = GPS_PROVIDERS[provider];
	const loggatorEventUrl = `${gpsProvider.apiBaseUrl}/events/${liveEventId}`;

	try {
		const response = await fetch(loggatorEventUrl);

		const loggatorEvent = loggatorEventSchema.parse(await response.json());
		competitors = loggatorEvent.competitors.map((c) => ({ deviceId: c.device_id, name: c.name }));
	} catch (e) {
		console.error(e);
		throw error(500);
	}

	let runners = locals.db
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
			competitors.map((c) => ({ key: `${liveEvent.id}|${c.deviceId}`, name: c.name }))
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
		const { user } = await locals.authRequest.validateUser();
		if (!user) throw redirect(302, '/login');
		if (user.emailVerified === 0) throw redirect(302, '/email-verification');

		const formData = await request.formData();

		const runnersFormData: Record<
			string,
			{ liveEvent: string | null; trackingDeviceId: string | null; userId: string | null }
		> = {};

		for (const [key, value] of formData.entries()) {
			if (value instanceof File) return;

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

		const liveEvents = await locals.db
			.select()
			.from(liveEvent)
			.where(eq(liveEvent.fkEvent, eventId))
			.all();

		const tracks = await getTracksFromLiveEvents(liveEvents, fetch);

		const runners = locals.db.query.runner.findMany({
			where: eq(runnerTable.fkEvent, eventId),
			with: { legs: true }
		});

		const legs = locals.db.query.leg.findMany({
			where: eq(legTable.fkEvent, eventId),
			with: { routechoices: true }
		});

		const controlPoints = locals.db
			.select()
			.from(controlPointTable)
			.where(eq(controlPointTable.fkEvent, eventId));

		detectRunnersRoutechoices;

		await locals.db.transaction(async (tx) => {
			Object.entries(runnersFormData).forEach(
				async ([runnerId, { liveEvent, trackingDeviceId, userId }]) => {
					await tx
						.update(runnerTable)
						.set({
							fkLiveEvent: liveEvent,
							trackingDeviceId,
							fkUser: userId
						})
						.where(eq(runnerTable.id, runnerId))
						.run();
				}
			);

			throw redirect(302, `/events/${eventId}`);
		});
	}
};
