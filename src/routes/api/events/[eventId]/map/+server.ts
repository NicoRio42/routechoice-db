import { GPS_PROVIDERS } from '$lib/constants.js';
import { extractLiveProviderAndEventIdFromUrl } from '$lib/helpers.js';
import { db } from '$lib/server/db/db.js';
import { liveEvent as liveEventTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { loggatorEventSchema, loggatorMapSchema } from 'orienteering-js/models';

export async function GET({ locals, params, fetch }) {
	if (locals.user === null) return new Response(null, { status: 401 });

	const liveEvent = await db
		.select()
		.from(liveEventTable)
		.where(eq(liveEventTable.fkEvent, params.eventId))
		.get();

	if (liveEvent === undefined) return new Response(null, { status: 404 });

	const [_, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);

	if (liveEvent.liveProvider === 'loggator') {
		const gpsProvider = GPS_PROVIDERS.loggator;
		const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;

		const eventResponse =
			import.meta.env.MODE === 'dev-offline'
				? await fetch('http://localhost:5173/20220622meylan.json')
				: await fetch(eventUrl);

		if (!eventResponse.ok) {
			return new Response(`Failed to load loggator event with id ${eventId}`, { status: 500 });
		}

		const loggatorEvent = loggatorEventSchema.parse(await eventResponse.json());
		const loggatorMap = loggatorMapSchema.parse(loggatorEvent.map);

		return new Response(loggatorMap.url, { status: 200 });
	}

	if (liveEvent.liveProvider === 'gps-seuranta') {
		const gpsProvider = GPS_PROVIDERS['gps-seuranta'];

		return new Response(`${gpsProvider.apiBaseUrl}/${eventId}/map`, { status: 200 });
	}

	return new Response('Provider not supported', { status: 400 });
}
