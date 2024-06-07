import {
	getCompetitorsFromLiveEvent,
	parseRoutechoicesTracksInLegs,
	sortLegsAndRoutechoices
} from '$lib/helpers.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import {
	leg as legTable,
	liveEvent as liveEventTable,
	runner as runnerTable,
	user as userTable
} from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
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

	const runners = await db.query.runner.findMany({
		where: eq(runnerTable.fkEvent, eventId),
		with: { legs: true }
	});

	// If no attribution, make initial attribution
	if (runners.every((r) => r.fkUser === null && r.trackingDeviceId === null)) {
		const runnersWithAttributedUsers = matchRunnersByName(
			runners.map((r) => ({
				id: r.id,
				firstName: r.firstName,
				lastName: r.lastName,
				userId: r.fkUser,
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
			if (attributedRunner.userId !== null) runner.fkUser = attributedRunner.userId;
			if (attributedRunner.trackingDeviceId !== null) {
				runner.trackingDeviceId = attributedRunner.trackingDeviceId;
				runner.fkLiveEvent = liveEvent.id;
			}
		});
	}

	const legs = await db.query.leg.findMany({
		where: eq(legTable.fkEvent, eventId),
		with: { routechoices: true }
	});

	const sortedLegs = sortLegsAndRoutechoices(legs);
	const sortedLegsWithRoutechoicesWithParsedTracks = parseRoutechoicesTracksInLegs(sortedLegs);

	return {
		users,
		competitors,
		runners,
		liveEvent,
		legs: sortedLegsWithRoutechoicesWithParsedTracks
	};
}
