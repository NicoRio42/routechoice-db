import { db } from '$lib/server/db/db.js';
import {
	event as eventTable,
	leg as legTable,
	routechoice as routechoiceTable
} from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const actions = {
	delete: async ({ locals, params: { eventId, legId, routechoiceId } }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const routechoice = await db
			.select()
			.from(routechoiceTable)
			.innerJoin(legTable, eq(routechoiceTable.fkLeg, legTable.id))
			.innerJoin(eventTable, eq(legTable.fkEvent, eventTable.id))
			.where(
				and(
					eq(routechoiceTable.id, routechoiceId),
					eq(legTable.id, legId),
					eq(eventTable.id, eventId)
				)
			)
			.run();

		if (routechoice === undefined) {
			throw error(400, "Routechoice doesn't belong to the given leg and event.");
		}

		await db.delete(routechoiceTable).where(eq(routechoiceTable.id, routechoiceId)).run();

		redirect(302, `/events/${eventId}`);
	}
};
