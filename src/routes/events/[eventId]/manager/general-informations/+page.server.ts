import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { generalInformationsSchema } from './schema.js';
import {
	assoEventTag as assoEventTagTable,
	event as eventTable,
	tag as tagTable
} from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function load({ locals, params: { eventId } }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const event = await locals.db.query.event.findFirst({
		where: eq(eventTable.id, eventId),
		with: { tags: true }
	});

	if (event == undefined) {
		return error(404);
	}

	const form = await superValidate(
		{
			name: event.name,
			tags: event.tags.map((tag) => tag.fkTag).filter((t): t is string => t !== null)
		},
		generalInformationsSchema
	);

	const tags = locals.db.select().from(tagTable).all();

	return { form, tags };
}

export const actions = {
	default: async ({ locals, params: { eventId }, request }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const form = await superValidate(request, generalInformationsSchema);
		if (!form.valid) return setError(form, 'An error occured while changing event informations');

		const event = await locals.db.query.event.findFirst({
			where: eq(eventTable.id, eventId),
			with: { tags: true }
		});

		if (event == undefined) {
			return error(404);
		}

		const eventTags = event.tags.map((tag) => tag.fkTag).filter((t): t is string => t !== null);

		await locals.db
			.update(eventTable)
			.set({ name: form.data.name })
			.where(eq(eventTable.id, eventId))
			.run();

		const tagsAreUnchanged =
			form.data.tags.every((t) => eventTags.includes(t)) &&
			eventTags.every((t) => form.data.tags.includes(t));

		if (tagsAreUnchanged) {
			throw redirect(302, '/events');
		}

		await locals.db.delete(assoEventTagTable).where(eq(assoEventTagTable.fkEvent, eventId)).run();

		if (form.data.tags.length === 0) {
			throw redirect(302, '/events');
		}

		await locals.db
			.insert(assoEventTagTable)
			.values(form.data.tags.map((t) => ({ fkEvent: eventId, fkTag: t })))
			.run();

		throw redirect(302, '/events');
	}
};
