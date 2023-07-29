import {
	assoEventTag as assoEventTagTable,
	event as eventTable,
	tag as tagTable
} from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { desc, eq, inArray } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms/server';
import { filterEventFormSchema } from './schema.js';
import { redirectIfNotLogedIn } from '$lib/server/auth/helpers.js';

export async function load({ url, locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotLogedIn(user);

	const form = await superValidate(filterEventFormSchema);

	const tagsIds = getTagsFromSearchParams(url);

	let events = await locals.db.query.event.findMany({
		orderBy: desc(eventTable.startTime),
		with: { tags: { columns: { fkTag: true } } }
	});

	// TODO: do this in sql when limit is needed
	if (tagsIds.length !== 0) {
		events = events.filter((event) => event.tags.some((tag) => tagsIds.includes(tag.fkTag ?? '')));
	}

	// await locals.db
	// 	.select()
	// 	.from(eventTable)
	// 	.innerJoin(assoEventTagTable, eq(assoEventTagTable.fkEvent, eventTable.id))
	// 	.where(inArray(assoEventTagTable.fkTag, tagsIds))
	// 	.orderBy(desc(eventTable.startTime))
	// 	.all();

	const tags = locals.db.select().from(tagTable).all();

	return { events, user, tags, form };
}

function getTagsFromSearchParams(url: URL): string[] {
	const tagsString = url.searchParams.get('tags');
	if (tagsString === null || tagsString === '') return [];
	return tagsString.split(',');
}
