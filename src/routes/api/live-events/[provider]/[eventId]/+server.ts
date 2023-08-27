import { GPS_PROVIDERS } from '$lib/constants.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { error, redirect } from '@sveltejs/kit';

export async function GET({ fetch, params: { provider, eventId }, locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const gpsProvider = GPS_PROVIDERS[provider];
	if (gpsProvider === undefined) throw error(404, 'Not found');
	const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;

	const response =
		import.meta.env.MODE === 'dev-offline'
			? await fetch('http://localhost:5173/20220622meylan.json')
			: await fetch(eventUrl);

	return new Response(response.body);
}
