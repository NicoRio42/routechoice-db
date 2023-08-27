import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { generalInformationsSchema } from './schema.js';
import { event as eventTable, tag as tagTable } from '$lib/server/db/schema.js';
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
			tags: event.tags.map((tag) => tag.fkTag).join(',')
		},
		generalInformationsSchema
	);

	const tags = locals.db.select().from(tagTable).all();

	return { form, tags };
}
