import { LOGGATOR_POLE_FRANCE_BASIC_AUTH } from '$env/static/private';
import { GPS_PROVIDERS } from '$lib/constants.js';
import { error, json } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';

const parser = new DOMParser();

export async function GET({ fetch, params: { provider }, locals }) {
	if (locals.user === null) throw error(401);
	if (locals.user.role !== 'admin') throw error(403);

	if (import.meta.env.MODE === 'dev-offline') return json([]);

	if (provider !== 'loggator') throw error(404, 'Only loggator is supported');
	const gpsProvider = GPS_PROVIDERS[provider];
	if (gpsProvider === undefined || provider !== 'loggator') throw error(404, 'Not found');

	const response = await fetch('https://loggator.com/users/7/private_events', {
		headers: { Authorization: `Basic ${LOGGATOR_POLE_FRANCE_BASIC_AUTH}` }
	});

	const body = await response.text();
	const doc = parser.parseFromString(body, 'text/html');

	const links = doc.querySelectorAll('tbody td:first-child + td a');

	const events = Array.from(links).map((link) => {
		const url = link.getAttribute('href');
		const name = link.textContent.trim();
		return { url, name };
	});

	return json(events);
}
