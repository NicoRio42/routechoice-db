import { redirectIfNotLogedIn } from '$lib/server/auth/helpers.js';
import {
	assoEventTag,
	assoEventTag as assoEventTagTable,
	event as eventTable,
	tag as tagTable,
	type Event
} from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { and, desc, eq, inArray, like, type SQL } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms/server';
import { filterEventFormSchema } from './schema.js';

const PAGE_SIZE = 20;

export async function load({ url, locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotLogedIn(user);

	const form = await superValidate(url.searchParams, filterEventFormSchema);
	console.log(form.data);
	const pageNumber = form.data.pageNumber;
	const tags = locals.db.select().from(tagTable).all();

	let filteredEventsSelect = locals.db
		.select()
		.from(eventTable)
		.orderBy(desc(eventTable.startTime))
		.limit(PAGE_SIZE + 1)
		.offset((pageNumber - 1) * PAGE_SIZE);

	const whereClauses: SQL<unknown>[] = [];

	if (form.data.tags.length !== 0) {
		whereClauses.push(
			inArray(
				eventTable.id,
				locals.db
					.select({ id: eventTable.id })
					.from(eventTable)
					.innerJoin(assoEventTagTable, eq(assoEventTag.fkEvent, eventTable.id))
					.where(inArray(assoEventTagTable.fkTag, form.data.tags))
			)
		);
	}

	if (form.data.search.length !== 0) {
		whereClauses.push(like(eventTable.name, `%${form.data.search}%`));
	}

	if (whereClauses.length === 1) {
		filteredEventsSelect = filteredEventsSelect.where(whereClauses[0]);
	} else if (whereClauses.length !== 0) {
		filteredEventsSelect = filteredEventsSelect.where(and(...whereClauses));
	}

	const filteredEventsWith = locals.db.$with('filtered_event').as(filteredEventsSelect);

	const eventRaw = await locals.db
		.with(filteredEventsWith)
		.select()
		.from(filteredEventsWith)
		.leftJoin(assoEventTag, eq(assoEventTag.fkEvent, filteredEventsWith.id))
		.all();

	type FormattedEvent = Event & { tagIds: string[] };
	const events: FormattedEvent[] = [];

	for (const { filtered_event, asso_event_tag } of eventRaw) {
		const foundEvent = events.find((e) => e.id === filtered_event.id);

		if (foundEvent === undefined) {
			const newEvent: FormattedEvent = { ...filtered_event, tagIds: [] };

			if (asso_event_tag !== null && asso_event_tag.fkTag !== null) {
				newEvent.tagIds.push(asso_event_tag.fkTag);
			}

			events.push(newEvent);
		} else if (asso_event_tag !== null && asso_event_tag.fkTag !== null) {
			foundEvent.tagIds.push(asso_event_tag.fkTag);
		}
	}

	const isLastPage = events.length !== PAGE_SIZE + 1;

	if (!isLastPage) {
		events.pop();
	}

	return { events, user, tags, form, pageNumber, isLastPage };
}
