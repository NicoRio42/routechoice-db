import { event } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';

export async function load({ url, locals }) {
	const { user } = await locals.authRequest.validateUser();
	if (!user) throw redirect(302, '/login');
	if (user.emailVerified === 0) throw redirect(302, '/email-verification');

	const tagsIds = getTagsFromSearchParams(url);

	const events = await locals.db.select().from(event).orderBy(desc(event.startTime)).all();

	return { events, user };
}

function getTagsFromSearchParams(url: URL): number[] {
	const tagsString = url.searchParams.get('tags');
	if (tagsString === null || tagsString === '') return [];
	const tagsStringIds = tagsString.split(',');

	const tagsIds: number[] = [];

	tagsStringIds.forEach((stringId) => {
		const id = parseInt(stringId);
		if (!isNaN(id)) tagsIds.push(id);
	});

	return tagsIds;
}
