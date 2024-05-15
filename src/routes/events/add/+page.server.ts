import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import {
	assoEventTag as assoEventTagTable,
	event as eventTable,
	liveEvent as liveEventTable,
	tag as tagTable
} from '$lib/server/db/schema.js';
import { reThrowRedirectsAndErrors } from '$lib/server/sveltekit-helpers.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addEventSchema } from './schema.js';

export async function load({ locals }) {
	redirectIfNotAdmin(locals.user);

	const form = await superValidate(zod(addEventSchema));
	const tags = await db.select().from(tagTable).all();

	return { form, tags };
}

export const actions = {
	default: async ({ request, locals }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const form = await superValidate(request, zod(addEventSchema));
		if (!form.valid) return fail(400, { form });

		const filteredTags = form.data.tags.filter(
			(tag) => tag.trim() !== '' && tag !== null && tag !== undefined
		);

		const eventId = crypto.randomUUID();

		try {
			await db
				.insert(eventTable)
				.values({
					id: eventId,
					name: form.data.name,
					startTime: form.data.startTime,
					publishTime: form.data.publishTime,
					finishTime: form.data.finishTime
				})
				.run();

			await db
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
				await db
					.insert(assoEventTagTable)
					.values(filteredTags.map((fkTag) => ({ fkEvent: eventId, fkTag })))
					.run();
			}

			throw redirect(302, `/events/${eventId}/manager/course-and-routechoices`);
		} catch (e) {
			reThrowRedirectsAndErrors(e);

			console.error(e);
			return setError(form, '', 'An error occured');
		}
	}
};
