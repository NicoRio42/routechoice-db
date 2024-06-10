import { getTracksMapFromLoggatorData } from 'orienteering-js/loggator';
import {
	loggatorEventSchema,
	loggatorMapSchema,
	loggatorPointsValidator,
	type CourseMap,
	type RunnerTrack
} from 'orienteering-js/models';
import { GPS_PROVIDERS } from './constants.js';
import type { LegWithRoutechoiceWithParsedTrack, LegWithRoutechoices } from './models/leg.model.js';
import type {
	RunnerWithNullableLegs,
	RunnerWithNullableLegsAndTrack
} from './models/runner.model.js';
import type { Leg, LiveEvent, Routechoice, RunnerLeg } from './server/db/models.js';
import { parseData, parseInit } from '@orienteering-js/gps/gpsseuranta';
import { routesColors } from 'orienteering-js/ocad';

export function extractLiveProviderAndEventIdFromUrl(
	url: string
): [keyof typeof GPS_PROVIDERS, string] {
	const provider = Object.entries(GPS_PROVIDERS).find(([providerId, { urls: providerUrls }]) =>
		providerUrls.some((u) => url.includes(u))
	);

	if (provider === undefined) throw new Error('Could not find provider from provided url.');

	if (provider[0] === 'loggator') {
		const eventId = url
			.split('/')
			.map((s) => s.trim())
			.filter((s) => s !== '')
			.at(-1);

		if (eventId === undefined) throw new Error('Could not extract eventId from provided url.');

		return ['loggator', eventId];
	}

	if (provider[0] === 'gps-seuranta') {
		const eventId = url.split('tulospalvelu.fi/gps/')[1].split('/')[0];
		if (eventId === undefined) throw new Error('Could not extract eventId from provided url.');
		return ['gps-seuranta', eventId];
	}

	throw new Error('Provider not supported');
}

export function formatDateForDateInput(date: Date): string {
	return (
		date.getFullYear().toString() +
		'-' +
		(date.getMonth() + 1).toString().padStart(2, '0') +
		'-' +
		date.getDate().toString().padStart(2, '0')
	);
}

export function formatTimeForDateInput(date: Date): string {
	return (
		date.getHours().toString().padStart(2, '0') +
		':' +
		date.getMinutes().toString().padStart(2, '0') +
		':' +
		date.getSeconds().toString().padStart(2, '0')
	);
}

export function formatDateTimeForDateTimeInput(date: Date): string {
	return `${formatDateForDateInput(date)}T${formatTimeForDateInput(date)}`;
}

type Fetch = typeof fetch;

export async function getTracksFromLiveEvents(
	liveEvents: LiveEvent[],
	options?: GetTracksOptions
): Promise<{ fkLiveEvent: string; trackingDeviceId: string; track: RunnerTrack }[]> {
	const providedFetch = options?.fetch ?? fetch;
	const proxyRequests = options?.proxyRequests ?? false;
	const tracks: { fkLiveEvent: string; trackingDeviceId: string; track: RunnerTrack }[] = [];

	for (const liveEvent of liveEvents) {
		const [_, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);

		if (liveEvent.liveProvider === 'loggator') {
			const gpsProvider = GPS_PROVIDERS.loggator;
			const pointsUrl = gpsProvider.getEventPointsUrl(eventId);
			const proxiedUrl = proxyRequests
				? `/api/proxy?urlToProxy=${encodeURI(pointsUrl)}`
				: pointsUrl;

			const pointsResponse =
				import.meta.env.MODE === 'dev-offline'
					? await providedFetch('http://localhost:5173/points.json')
					: await providedFetch(proxiedUrl);

			if (!pointsResponse.ok) {
				console.error(
					`[ERROR]  fetching points from Loggator: ${pointsResponse.status} ${pointsResponse.statusText}`
				);

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

		if (liveEvent.liveProvider === 'gps-seuranta') {
			const gpsProvider = GPS_PROVIDERS['gps-seuranta'];
			const dataUrl = gpsProvider.getEventPointsUrl(eventId);
			const proxiedUrl = proxyRequests ? `/api/proxy?urlToProxy=${encodeURI(dataUrl)}` : dataUrl;

			const data = await providedFetch(proxiedUrl).then((r) => r.text());
			const competitorsRoutesMap = parseData(data);

			tracks.push(
				...Object.entries(competitorsRoutesMap).map(([trackingDeviceId, track], index) => ({
					trackingDeviceId,
					track: {
						lons: track.longitudes,
						lats: track.latitudes,
						times: track.times,
						color: routesColors[index]
					},
					fkLiveEvent: liveEvent.id
				}))
			);
		}
	}

	return tracks;
}

export async function getEventMap(liveEvent: LiveEvent, fetch: Fetch): Promise<CourseMap> {
	const [_, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);

	if (liveEvent.liveProvider === 'loggator') {
		const gpsProvider = GPS_PROVIDERS.loggator;
		const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;

		const eventResponse =
			import.meta.env.MODE === 'dev-offline'
				? await fetch('http://localhost:5173/20220622meylan.json')
				: await fetch(eventUrl);

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
					point: { x: 0, y: 0 }
				},
				{
					gps: {
						lat: loggatorMap.coordinates.bottomLeft.lat,
						lon: loggatorMap.coordinates.bottomLeft.lng
					},
					point: { x: 0, y: -1 }
				},
				{
					gps: {
						lat: loggatorMap.coordinates.topRight.lat,
						lon: loggatorMap.coordinates.topRight.lng
					},
					point: { x: -1, y: 0 }
				}
			]
		};
	}

	if (liveEvent.liveProvider === 'gps-seuranta') {
		const gpsProvider = GPS_PROVIDERS['gps-seuranta'];
		const initUrl = `${gpsProvider.apiBaseUrl}/${eventId}/init.txt`;
		const init = await fetch(initUrl).then((r) => r.text());
		const [calibration] = parseInit(init);

		return { url: `${gpsProvider.apiBaseUrl}/${eventId}/map`, calibration };
	}

	throw new Error('Only Loggator is available in routechoice DB for the moment');
}

export async function getCompetitorsFromLiveEvent(
	liveEvent: LiveEvent,
	fetch: Fetch
): Promise<
	{
		deviceId: string;
		name: string;
	}[]
> {
	const [_, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);

	if (liveEvent.liveProvider === 'loggator') {
		const gpsProvider = GPS_PROVIDERS.loggator;
		const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;

		const eventResponse =
			import.meta.env.MODE === 'dev-offline'
				? await fetch('http://localhost:5173/20220622meylan.json')
				: await fetch(eventUrl);

		if (!eventResponse.ok) {
			throw new Error(`Failed to load loggator event with id ${eventId}`);
		}

		const loggatorEvent = loggatorEventSchema.parse(await eventResponse.json());

		return loggatorEvent.competitors
			.map((competitor) => ({ deviceId: competitor.device_id.toString(), name: competitor.name }))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	if (liveEvent.liveProvider === 'gps-seuranta') {
		const gpsProvider = GPS_PROVIDERS['gps-seuranta'];
		const initUrl = `${gpsProvider.apiBaseUrl}/${eventId}/init.txt`;
		const init = await fetch(initUrl).then((r) => r.text());
		const [_, competitors] = parseInit(init);

		return competitors
			.map((competitor) => ({
				deviceId: competitor.id,
				name: filterCompetitorName(competitor.name)
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	throw new Error('Only Loggator is available in routechoice DB for the moment');
}

function filterCompetitorName(name: string): string {
	return name
		.split(' ')
		.filter((n) => !/[0-9]/.test(n) && !n.includes('(') && !n.includes(')'))
		.join(' ');
}

export function sortRunnersAndRunnersLegs<
	R extends RunnerWithNullableLegs | RunnerWithNullableLegsAndTrack,
	L extends LegWithRoutechoices | Leg
>(runners: R[], legs: L[]): R[] {
	return runners
		.map((runner) => {
			const runnerLegs: (RunnerLeg | null)[] = [];

			legs.forEach((leg) => {
				const runnerLeg = runner.legs.find((l) => leg.id === l?.fkLeg);
				if (runnerLeg === undefined) runnerLegs.push(null);
				else runnerLegs.push(runnerLeg);
			});

			return { ...runner, legs: runnerLegs };
		})
		.sort((runnerA, runnerB) => {
			if (runnerA.rank === null && runnerB.rank === null) return 0;
			if (runnerA.rank === null) return 1;
			if (runnerB.rank === null) return -1;
			return runnerA.rank - runnerB.rank;
		});
}

export function sortLegsAndRoutechoices(legs: LegWithRoutechoices[]): LegWithRoutechoices[] {
	if (legs.length === 0) return [];
	const sortedLegs: LegWithRoutechoices[] = [];

	const firstLeg = legs.find((leg) =>
		legs.every((otherLeg) => otherLeg.fkFinishControlPoint !== leg.fkStartControlPoint)
	);

	if (firstLeg === undefined) {
		throw new Error('Circular course');
	}

	sortedLegs.push(firstLeg);

	while (sortedLegs.length !== legs.length) {
		const nextLeg = legs.find(
			(leg) => leg.fkStartControlPoint === sortedLegs[sortedLegs.length - 1].fkFinishControlPoint
		);

		if (nextLeg === undefined) break;

		sortedLegs.push({
			...nextLeg,
			routechoices: nextLeg.routechoices.sort((routechoiceA, routechoiceB) =>
				routechoiceA.name.localeCompare(routechoiceB.name)
			)
		});
	}

	return sortedLegs;
}

export function sortLegs<T extends LegWithRoutechoices | Leg>(legs: T[]): T[] {
	if (legs.length === 0) return [];
	const sortedLegs: T[] = [];

	const firstLeg = legs.find((leg) =>
		legs.every((otherLeg) => otherLeg.fkFinishControlPoint !== leg.fkStartControlPoint)
	);

	if (firstLeg === undefined) {
		throw new Error('Circular course');
	}

	sortedLegs.push(firstLeg);

	while (sortedLegs.length !== legs.length) {
		const nextLeg = legs.find(
			(leg) => leg.fkStartControlPoint === sortedLegs[sortedLegs.length - 1].fkFinishControlPoint
		);

		if (nextLeg === undefined) break;

		sortedLegs.push(nextLeg);
	}

	return sortedLegs;
}

export function parseRoutechoicesTracksInLegs(
	legs: LegWithRoutechoices[]
): LegWithRoutechoiceWithParsedTrack[] {
	return legs.map(parseRoutechoicesTracksInASingleLeg);
}

export function parseRoutechoicesTracksInASingleLeg(
	leg: LegWithRoutechoices
): LegWithRoutechoiceWithParsedTrack {
	return {
		...leg,
		routechoices: leg.routechoices.map((routechoice) => ({
			id: routechoice.id,
			name: routechoice.name,
			color: routechoice.color,
			length: routechoice.length,
			elevation: routechoice.elevation,
			track: parseRoutechoiceTrack(routechoice)
		}))
	};
}

function parseRoutechoiceTrack(routechoice: Routechoice): [number, number][] {
	const latitudes = routechoice.latitudes.split(';').map(parseFloatOrThrow);
	const longitudes = routechoice.longitudes.split(';').map(parseFloatOrThrow);

	if (latitudes.length !== longitudes.length) {
		throw new Error("Routechoice's longitudes and latitudes arrays are not the same size");
	}

	return latitudes.map((lat, index) => [lat, longitudes[index]]);
}

function parseFloatOrThrow(str: string): number {
	const num = parseFloat(str);
	if (isNaN(num)) throw new Error('The string is not a number');
	return num;
}

type GetTracksOptions = {
	fetch?: Fetch;
	proxyRequests?: boolean;
};

export async function getRunnersWithTracksAndSortedLegs(
	sortedLegs: (LegWithRoutechoices | LegWithRoutechoiceWithParsedTrack)[],
	liveEvents: LiveEvent[],
	runners: RunnerWithNullableLegs[],
	options?: GetTracksOptions
) {
	return getTracksFromLiveEvents(liveEvents, options)
		.then((tracks) =>
			runners.map((runner) => {
				const track = tracks.find(
					(t) =>
						t.trackingDeviceId === runner.trackingDeviceId && t.fkLiveEvent === runner.fkLiveEvent
				);

				return { ...runner, track: track === undefined ? null : track.track };
			})
		)
		.then((runners) => sortRunnersAndRunnersLegs(runners, sortedLegs));
}

export function addAlpha(color: string, opacity: number) {
	if (!color.startsWith('#')) throw new Error('Hexadecimal color should start with #');
	if (color.length !== 7 && color.length !== 9)
		throw new Error('Hexadecimal color should be 7 or 9 characters long');

	const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
	return color.slice(0, 7) + _opacity.toString(16).toUpperCase();
}

export function hslToHex(h: number, s: number, l: number) {
	// Must be fractions of 1
	s /= 100;
	l /= 100;

	let c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
		m = l - c / 2,
		r = 0,
		g = 0,
		b = 0;

	if (0 <= h && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (60 <= h && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (120 <= h && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (180 <= h && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (240 <= h && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (300 <= h && h < 360) {
		r = c;
		g = 0;
		b = x;
	}
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	let rStr = r.toString(16);
	let gStr = g.toString(16);
	let bStr = b.toString(16);

	if (rStr.length == 1) rStr = '0' + rStr;
	if (gStr.length == 1) gStr = '0' + gStr;
	if (bStr.length == 1) bStr = '0' + bStr;

	return '#' + rStr + gStr + bStr;
}

export function addSearchParamsToURL(url: URL, name: string, value: string): string {
	const newURL = new URL(url);
	newURL.searchParams.set(name, value);
	return newURL.toString();
}

export function deleteSearchParamsToURL(url: URL, name: string): string {
	const newURL = new URL(url);
	newURL.searchParams.delete(name);
	return newURL.toString();
}
