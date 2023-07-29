import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import {
	assoEventTag as assoEventTagTable,
	event,
	liveEvent,
	tag as tagTable
} from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { addEventSchema } from './schema.js';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const form = await superValidate(addEventSchema);
	const tags = locals.db.select().from(tagTable).all();

	return { form, tags };
}

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const form = await superValidate(request, addEventSchema);
		if (!form.valid) return fail(400, { form });

		await locals.db.transaction(async (tx) => {
			const eventId = crypto.randomUUID();

			await tx
				.insert(event)
				.values({
					id: eventId,
					name: form.data.name,
					startTime: new Date(form.data.startTime),
					publishTime: new Date(form.data.publishTime),
					finishTime: new Date(form.data.finishTime)
				})
				.run();

			await tx
				.insert(liveEvent)
				.values({
					id: crypto.randomUUID(),
					fkEvent: eventId,
					liveProvider: 'loggator',
					url: form.data.liveProviderUrl,
					isPrimary: true
				})
				.run();

			await tx
				.insert(assoEventTagTable)
				.values(form.data.tags.map((fkTag) => ({ fkEvent: eventId, fkTag })))
				.run();

			throw redirect(302, `/events/${eventId}/manager/course-and-routechoices`);
		});
	}
};
