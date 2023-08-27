import { redirectIfNotLogedIn } from '$lib/server/auth/helpers.js';
import { event as eventTable, tag as tagTable } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms/server';
import { filterEventFormSchema } from './schema.js';

export async function load({ url, locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotLogedIn(user);

	const form = await superValidate(url.searchParams, filterEventFormSchema);

	let events = await locals.db.query.event.findMany({
		orderBy: desc(eventTable.startTime),
		with: { tags: { columns: { fkTag: true } } }
	});

	console.log(form.data.tags);

	// TODO: do this in sql when limit is needed
	if (form.data.tags.length !== 0) {
		events = events.filter((event) =>
			event.tags.some((tag) => form.data.tags.includes(tag.fkTag ?? ''))
		);
	}

	const tags = locals.db.select().from(tagTable).all();

	return { events, user, tags, form };
}
