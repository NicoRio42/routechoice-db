import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import {
	event as eventTable,
	leg as legTable,
	routechoice as routechoiceTable
} from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const actions = {
	delete: async ({ locals, params: { eventId, legId, routechoiceId } }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const routechoice = await locals.db
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
			return fail(400, { error: "Routechoice doesn't belong to the givent leg and event." });
		}

		await locals.db.delete(routechoiceTable).where(eq(routechoiceTable.id, routechoiceId)).run();

		redirect(302, `/events/${eventId}`);
	}
};
