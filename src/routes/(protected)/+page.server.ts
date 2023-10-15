import { redirectIfNotLogedIn } from '$lib/server/auth/helpers.js';
import {
	assoEventTag,
	assoEventTag as assoEventTagTable,
	event as eventTable,
	tag as tagTable,
	type Event
} from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { and, desc, eq, exists, inArray } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms/server';
import { filterEventFormSchema } from './schema.js';

const PAGE_SIZE = 10;

export async function load({ url, locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotLogedIn(user);

	const form = await superValidate(url.searchParams, filterEventFormSchema);
	const pageNumber = form.data.pageNumber;

	console.log(form.data);

	const tags = locals.db.select().from(tagTable).all();

	const queryWithoutTagsFilter = locals.db
		.select()
		.from(eventTable)
		.leftJoin(assoEventTag, eq(assoEventTag.fkEvent, eventTable.id))
		.orderBy(desc(eventTable.startTime));

	const tagsClause = inArray(assoEventTagTable.fkTag, form.data.tags);

	const paginationClause =
		form.data.tags.length === 0
			? inArray(
					eventTable.id,
					locals.db
						.select({ id: eventTable.id })
						.from(eventTable)
						.limit(PAGE_SIZE)
						.offset((pageNumber - 1) * PAGE_SIZE)
			  )
			: inArray(
					eventTable.id,
					locals.db
						.select({ id: eventTable.id })
						.from(eventTable)
						.where(
							exists(
								locals.db
									.select()
									.from(eventTable)
									.leftJoin(assoEventTag, eq(assoEventTag.fkEvent, eventTable.id))
									.where(inArray(assoEventTagTable.fkTag, form.data.tags))
							)
						)
						.orderBy(desc(eventTable.startTime))
						.limit(PAGE_SIZE)
						.offset((pageNumber - 1) * PAGE_SIZE)
			  );

	const query =
		form.data.tags.length === 0
			? queryWithoutTagsFilter.where(paginationClause)
			: queryWithoutTagsFilter.where(and(paginationClause, tagsClause));

	console.log(query.toSQL());

	const eventRaw = await query.all();

	type FormattedEvent = Event & { tagIds: string[] };
	const events: FormattedEvent[] = [];

	for (const { event, asso_event_tag } of eventRaw) {
		const foundEvent = events.find((e) => e.id === event.id);

		if (foundEvent === undefined) {
			const newEvent: FormattedEvent = { ...event, tagIds: [] };

			if (asso_event_tag !== null && asso_event_tag.fkTag !== null) {
				newEvent.tagIds.push(asso_event_tag.fkTag);
			}

			events.push(newEvent);
		} else if (asso_event_tag !== null && asso_event_tag.fkTag !== null) {
			foundEvent.tagIds.push(asso_event_tag.fkTag);
		}
	}

	return { events, user, tags, form, pageNumber };
}
