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

export function assignRunnerTracksFromLiveEvent(event: Event, fetch: Fetch) {}
