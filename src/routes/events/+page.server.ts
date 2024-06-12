import { redirectIfNotLogedIn } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import type { Event } from '$lib/server/db/models.js';
import {
	assoEventTag,
	assoEventTag as assoEventTagTable,
	event as eventTable,
	file as fileTable,
	tag as tagTable
} from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, inArray, like, type SQL } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { filterEventFormSchema } from './schema.js';

const PAGE_SIZE = 20;

export async function load({ url, locals }) {
	redirectIfNotLogedIn(locals.user);

	const form = await superValidate(url.searchParams, zod(filterEventFormSchema));
	const pageNumber = form.data.pageNumber;
	const tags = await db.select().from(tagTable).all();

	let filteredEventsSelect = db
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
				db
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

	const filteredEventsSelectWithWhereClauses =
		whereClauses.length === 0
			? filteredEventsSelect
			: whereClauses.length === 1
				? filteredEventsSelect.where(whereClauses[0])
				: filteredEventsSelect.where(and(...whereClauses));

	const filteredEventsWith = db.$with('filtered_event').as(filteredEventsSelectWithWhereClauses);

	const eventRaw = await db
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

	const filesPromise = db
		.select()
		.from(fileTable)
		.where(
			inArray(
				fileTable.fkEvent,
				events.map((e) => e.id)
			)
		)
		.all();

	return { events, user: locals.user, tags, form, pageNumber, isLastPage, filesPromise };
}

export const actions = {
	deleteEvent: async ({ locals, request }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();
		const eventId = formData.get('eventId');
		if (typeof eventId !== 'string') throw error(400);

		await db.delete(eventTable).where(eq(eventTable.id, eventId)).run();

		throw redirect(302, '/events');
	}
};
