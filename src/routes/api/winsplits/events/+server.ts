import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { error, json } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';

export async function GET({ url, fetch, locals }) {
	if (locals.user === null) throw error(401);
	if (locals.user.role !== 'admin') throw error(403);

	const date = url.searchParams.get('date');
	if (date === null) throw error(400);

	const response = await fetch(`${TWO_D_RERUN_URL}?date=${date}`, {
		headers: { Referer: 'http://loggator2.worldofo.com' }
	});

	const eventsText = await response.text();

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(eventsText, 'text/xml');
	const eventTags = xmlDoc.querySelectorAll('Event');

	const events = [...eventTags].map((eventTag) => {
		const idTag = eventTag.querySelector('Id');
		const nameTag = eventTag.querySelector('Name');

		if (idTag === null || nameTag === null) throw new Error('Problem with file format');

		const id = idTag.textContent;
		const description = nameTag.textContent;

		if (id === null || description === null) throw new Error('Problem with file format');

		return {
			id,
			description
		};
	});

	return json(events);
}
