import { getTracksMapFromLoggatorData } from 'orienteering-js/loggator';
import {
	loggatorPointsValidator,
	type CourseMap,
	type RunnerTrack,
	loggatorEventSchema,
	type Map as LoggatorMap,
	loggatorMapSchema
} from 'orienteering-js/models';
import { GPS_PROVIDERS } from './constants.js';
import type { LiveEvent, Runner } from './server/db/schema.js';

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

type Event = {
	liveEvents: LiveEvent[];
	runners: Runner[];
};

type Fetch = typeof fetch;

export async function getRunnersWithTracks<T>(
	event: T & Event,
	fetch: Fetch
): Promise<T & { runners: (Runner & { track: RunnerTrack | null })[] }> {
	const eventWithRunnersTracks = {
		...event,
		runners: event.runners.map((runner) => {
			let runnerWithTrack: typeof runner & { track: RunnerTrack | null };
			runnerWithTrack = { ...runner, track: null };
			return runnerWithTrack;
		})
	};

	for (const liveEvent of event.liveEvents) {
		if (liveEvent.liveProvider === 'loggator') {
			const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);
			const gpsProvider = GPS_PROVIDERS.loggator;
			const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;
			const pointsUrl = `${eventUrl}/points`;
			const pointsResponse = await fetch(pointsUrl);

			if (!pointsResponse.ok) {
				throw new Error(`Failed to load points for loggator event with id ${eventId}`);
			}

			const loggatorPoints = loggatorPointsValidator.parse(await pointsResponse.json());

			const tracksMap = getTracksMapFromLoggatorData(loggatorPoints);
			eventWithRunnersTracks.runners.forEach((runner) => {
				if (runner.fkLiveEvent !== liveEvent.id || runner.trackingDeviceId === null) {
					return;
				}

				const track = tracksMap[runner.trackingDeviceId];

				if (track === undefined) {
					return;
				}

				runner.track = track;
			});
		}

		// Future providers
	}

	return eventWithRunnersTracks;
}

export async function getEventMap(liveEvent: LiveEvent, fetch: Fetch): Promise<CourseMap> {
	if (liveEvent.liveProvider === 'loggator') {
		const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);
		const gpsProvider = GPS_PROVIDERS.loggator;
		const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;
		const eventResponse = await fetch(eventUrl);

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
