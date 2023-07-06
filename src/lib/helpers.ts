import { getTracksMapFromLoggatorData } from 'orienteering-js/loggator';
import {
	loggatorEventSchema,
	loggatorMapSchema,
	loggatorPointsValidator,
	type CourseMap,
	type RunnerTrack
} from 'orienteering-js/models';
import { GPS_PROVIDERS } from './constants.js';
import type { LiveEvent } from './server/db/schema.js';

export function extractLiveProviderAndEventIdFromUrl(
	url: string
): [keyof typeof GPS_PROVIDERS, string] {
	const provider = Object.entries(GPS_PROVIDERS).find(([providerId, { url: providerUrl }]) =>
		url.startsWith(providerUrl)
	);

	if (provider === undefined) throw new Error('');

	if (provider[0] === 'loggator') {
		const eventId = url
			.split('/')
			.map((s) => s.trim())
			.filter((s) => s !== '')
			.at(-1);
		if (eventId === undefined) throw new Error('');
		return ['loggator', eventId];
	}

	throw new Error('Provider not supported');
}

export function formatDateForDateInput(date: Date): string {
	return `${date.getFullYear().toString()}-${(date.getMonth() + 1)
		.toString()
		.padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

export function formatDateTimeForDateTimeInput(date: Date): string {
	return `${formatDateForDateInput(date)}T${date.toLocaleTimeString()}`;
}

type Fetch = typeof fetch;

export async function getTracksFromLiveEvents(
	liveEvents: LiveEvent[],
	fetch: Fetch
): Promise<{ fkLiveEvent: string; trackingDeviceId: string; track: RunnerTrack }[]> {
	const tracks: { fkLiveEvent: string; trackingDeviceId: string; track: RunnerTrack }[] = [];

	for (const liveEvent of liveEvents) {
		if (liveEvent.liveProvider === 'loggator') {
			const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);
			const gpsProvider = GPS_PROVIDERS.loggator;
			const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;
			const pointsUrl = `${eventUrl}/points`;
			// const pointsResponse = await fetch(pointsUrl);
			const pointsResponse = await fetch('http://localhost:5173/points.json');

			if (!pointsResponse.ok) {
				throw new Error(`Failed to load points for loggator event with id ${eventId}`);
			}

			const loggatorPoints = loggatorPointsValidator.parse(await pointsResponse.json());

			const tracksMap = getTracksMapFromLoggatorData(loggatorPoints);

			tracks.push(
				...Object.entries(tracksMap).map(([trackingDeviceId, track]) => ({
					trackingDeviceId,
					track,
					fkLiveEvent: liveEvent.id
				}))
			);
		}
	}

	return tracks;
}

export async function getEventMap(liveEvent: LiveEvent, fetch: Fetch): Promise<CourseMap> {
	if (liveEvent.liveProvider === 'loggator') {
		const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);
		const gpsProvider = GPS_PROVIDERS.loggator;
		const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;
		// const eventResponse = await fetch(eventUrl);
		const eventResponse = await fetch('http://localhost:5173/20220622meylan.json');

		if (!eventResponse.ok) {
			throw new Error(`Failed to load loggator event with id ${eventId}`);
		}

		const loggatorEvent = loggatorEventSchema.parse(await eventResponse.json());
		const loggatorMap = loggatorMapSchema.parse(loggatorEvent.map);

		return {
			url: loggatorMap.url,
			calibration: [
				{
					gps: {
						lat: loggatorMap.coordinates.topLeft.lat,
						lon: loggatorMap.coordinates.topLeft.lng
					},
					point: { x: 1, y: 1 }
				},
				{
					gps: {
						lat: loggatorMap.coordinates.bottomLeft.lat,
						lon: loggatorMap.coordinates.bottomLeft.lng
					},
					point: { x: 1, y: -1 }
				},
				{
					gps: {
						lat: loggatorMap.coordinates.topRight.lat,
						lon: loggatorMap.coordinates.topRight.lng
					},
					point: { x: -1, y: 1 }
				}
			]
		};
	}

	throw new Error('Only Loggator is available in routechoice DB for the moment');
}
