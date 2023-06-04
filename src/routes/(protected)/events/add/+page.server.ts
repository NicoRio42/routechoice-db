import { setError, superValidate } from 'sveltekit-superforms/server';
import { addEventSchema } from './schema.js';
import { redirect } from '@sveltejs/kit';
import { event, liveEvent, type Event } from '$lib/server/db/schema.js';

export async function load() {
	const form = await superValidate(addEventSchema);
	return { form };
}

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, addEventSchema);

		if (!form.valid) {
			return setError(form, null, 'Bad form input');
		}

		await locals.db.transaction(async (tx) => {
			const newEvent = await tx
				.insert(event)
				.values({
					name: form.data.name,
					startTime: new Date(form.data.startTime),
					publishTime: new Date(form.data.publishTime),
					finishTime: new Date(form.data.finishTime)
				})
				.returning()
				.get();

			await tx
				.insert(liveEvent)
				.values({
					fkEvent: newEvent.id,
					liveProvider: '',
					url: form.data.liveProviderUrl,
					isPrimary: true
				})
				.run();

			throw redirect(302, `/events/${newEvent.id}/manager`);
		});
	}
};
