import { GPS_PROVIDERS } from '$lib/constants.js';
import { error } from '@sveltejs/kit';

export async function GET({ fetch, params: { provider, eventId } }) {
	const gpsProvider = GPS_PROVIDERS[provider];
	if (gpsProvider === undefined) throw error(404, 'Not found');
	const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;
	// const response = await fetch(eventUrl);
	const response = await fetch('http://localhost:5173/20220622meylan.json');
	return new Response(response.body);
}
