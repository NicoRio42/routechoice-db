import { sortLegs } from '$lib/helpers.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { controlPoint as controlPointTable, leg as legTable } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params: { eventId }, locals }) {
	redirectIfNotAdmin(locals.user);

	const legs = await db.query.leg.findMany({
		with: { startControlPoint: true, finishControlPoint: true },
		where: eq(legTable.fkEvent, eventId)
	});

	const sortedLegs = sortLegs(legs);

	return { legs: sortedLegs };
}

export const actions = {
	deleteControlPoint: async ({ request, locals, params: { eventId } }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();
		const controlPointId = formData.get('controlPointId');

		if (typeof controlPointId !== 'string') {
			throw error(400);
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

		// Will delete cascade previousLeg and nextLeg
		await db.delete(controlPointTable).where(eq(controlPointTable.id, controlPointId)).run();

		// Creating leg from previous control point to next control point if not start or finish
		if (previousLeg !== undefined && nextLeg !== undefined) {
			await db
				.insert(legTable)
				.values({ ...previousLeg, fkFinishControlPoint: nextLeg.fkFinishControlPoint })
				.run();
		}

		throw redirect(302, `/events/${eventId}/manager/course-and-routechoices/manage-course`);
	}
};
