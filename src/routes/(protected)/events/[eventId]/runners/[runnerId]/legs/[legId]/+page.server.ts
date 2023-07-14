import {
	runner as runnerFromDatabase,
	runnerLeg as runnerLegFromDatabase
} from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
	updateRoutechoice: async ({ request, params: { eventId, runnerId, legId }, locals }) => {
		const { user } = await locals.authRequest.validateUser();

		if (user === null) {
			return fail(403);
		}

		const runner = await locals.db
			.select()
			.from(runnerFromDatabase)
			.where(eq(runnerFromDatabase.id, runnerId))
			.get();

		const runnerLeg = await locals.db
			.select()
			.from(runnerLegFromDatabase)
			.where(eq(runnerLegFromDatabase.id, legId))
			.get();

		if (runnerLeg.fkRunner !== runnerId) {
			return fail(400);
		}

		if (runner.fkUser !== user.id && user.role !== 'admin') {
			return fail(403);
		}

		const formData = await request.formData();
		const newRoutechoiceId = formData.get('routechoiceId');

		if (newRoutechoiceId === null || newRoutechoiceId instanceof File) {
			return fail(400);
		}

		await locals.db
			.update(runnerLegFromDatabase)
			.set({ fkManualRoutechoice: newRoutechoiceId })
			.where(eq(runnerLegFromDatabase.id, legId))
			.run();

		throw redirect(302, `/events/${eventId}`);
	}
};
