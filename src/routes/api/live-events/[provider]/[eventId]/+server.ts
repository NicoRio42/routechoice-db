import { GPS_PROVIDERS } from '$lib/constants.js';
import { error } from '@sveltejs/kit';

export async function GET({ fetch, params: { provider, eventId }, locals }) {
	if (locals.user === null) throw error(401);
	if (locals.user.role !== 'admin') throw error(403);

	const gpsProvider = GPS_PROVIDERS[provider];
	if (gpsProvider === undefined) throw error(404, 'Not found');
	const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;

	const response =
		import.meta.env.MODE === 'dev-offline'
			? await fetch('http://localhost:5173/20220622meylan.json')
			: await fetch(eventUrl);

	return new Response(response.body);
}
