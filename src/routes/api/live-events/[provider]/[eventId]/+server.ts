import { GPS_PROVIDERS } from '$lib/constants.js';
import { error } from '@sveltejs/kit';

export async function GET({ fetch, params: { provider, eventId } }) {
	const gpsProvider = GPS_PROVIDERS[provider];
	if (gpsProvider === undefined) throw error(404, 'Not found');
	const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;
	const response = await fetch(eventUrl);
	return new Response(response.body);
}
