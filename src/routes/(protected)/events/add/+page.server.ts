import { event, liveEvent } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { addEventSchema } from './schema.js';

export async function load() {
	const form = await superValidate(addEventSchema);
	return { form };
}

export const actions = {
	default: async ({ request, locals }) => {
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

			throw redirect(302, `/events/${eventId}/manager/course-and-routechoices`);
		});
	}
};
