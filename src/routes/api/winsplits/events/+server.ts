import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { error, json, redirect } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';

export async function GET({ url, fetch, locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const date = url.searchParams.get('date');
	if (date === null) throw error(400);

	console.log(`${TWO_D_RERUN_URL}?date=${date}`);

	const response = await fetch(`${TWO_D_RERUN_URL}?date=${date}`, {
		headers: { Referer: 'http://loggator2.worldofo.com' }
	});

	console.log(response.status, response.statusText);

	const eventsText = await response.text();

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(eventsText, 'text/xml');
	const eventTags = xmlDoc.querySelectorAll('Event');

	const events = Array.from(eventTags).map((eventTag) => {
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
