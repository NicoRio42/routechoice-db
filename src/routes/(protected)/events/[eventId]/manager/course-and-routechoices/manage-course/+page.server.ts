import { sortLegs } from '$lib/helpers.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { controlPoint as controlPointTable, leg as legTable } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params: { eventId }, locals: { db, authRequest } }) {
	const session = await authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const legs = await db.query.leg.findMany({
		with: { startControlPoint: true, finishControlPoint: true },
		where: eq(legTable.fkEvent, eventId)
	});

	const sortedLegs = sortLegs(legs, false);

	return { legs: sortedLegs };
}

export const actions = {
	deleteControlPoint: async ({
		url: { searchParams },
		locals: { db, authRequest },
		params: { eventId }
	}) => {
		const session = await authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const controlPointId = searchParams.get('controlPointId');

		if (controlPointId === null) {
			return;
		}

		const previousLeg = await db
			.select()
			.from(legTable)
			.where(eq(legTable.fkFinishControlPoint, controlPointId))
			.get();

		const nextLeg = await db
			.select()
			.from(legTable)
			.where(eq(legTable.fkStartControlPoint, controlPointId))
			.get();

		if (previousLeg === undefined || nextLeg === undefined) {
			return;
		}

		// Will delete cascade previousLeg and nextLeg
		await db.delete(controlPointTable).where(eq(controlPointTable.id, controlPointId)).run();

		// Creating leg from previous control point to next control point
		await db
			.insert(legTable)
			.values({ ...previousLeg, fkFinishControlPoint: nextLeg.fkFinishControlPoint })
			.run();

		throw redirect(302, `/events/${eventId}/manager/course-and-routechoices/manage-course`);
	}
};
