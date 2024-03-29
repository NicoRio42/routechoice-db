import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { json, redirect } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';

export async function GET({ params: { eventId }, locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const response = await fetch(`${TWO_D_RERUN_URL}?id=${eventId}`);
	const classesText = await response.text();

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(classesText, 'text/xml');
	const eventTags = xmlDoc.querySelectorAll('Class');

	const classes = Array.from(eventTags).map((eventTag) => {
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

	return json(classes);
}
