import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import {
	assoEventTag as assoEventTagTable,
	event as eventTable,
	liveEvent as liveEventTable,
	tag as tagTable
} from '$lib/server/db/schema.js';
import { reThrowRedirectsAndErrors } from '$lib/server/sveltekit-helpers.js';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
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

		const filteredTags = form.data.tags.filter(
			(tag) => tag.trim() !== '' && tag !== null && tag !== undefined
		);

		const eventId = crypto.randomUUID();

		try {
			await locals.db
				.insert(eventTable)
				.values({
					id: eventId,
					name: form.data.name,
					startTime: new Date(form.data.startTime),
					publishTime: new Date(form.data.publishTime),
					finishTime: new Date(form.data.finishTime)
				})
				.run();

			await locals.db
				.insert(liveEventTable)
				.values({
					id: crypto.randomUUID(),
					fkEvent: eventId,
					liveProvider: 'loggator',
					url: form.data.liveProviderUrl,
					isPrimary: true
				})
				.run();

			if (filteredTags.length !== 0) {
				await locals.db
					.insert(assoEventTagTable)
					.values(filteredTags.map((fkTag) => ({ fkEvent: eventId, fkTag })))
					.run();
			}

			throw redirect(302, `/events/${eventId}/manager/course-and-routechoices`);
		} catch (e) {
			reThrowRedirectsAndErrors(e);

			console.error(e);
			return setError(form, null, 'An error occured');
		}
	}
};
