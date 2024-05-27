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
import type {
	LiveEvent,
	Routechoice,
	RoutechoiceStatistics,
	RunnerLeg
} from './server/db/schema.js';
import { parseInit, parseData } from '@orienteering-js/gps/gpsseuranta';
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
	fetch: Fetch
): Promise<{ fkLiveEvent: string; trackingDeviceId: string; track: RunnerTrack }[]> {
	const tracks: { fkLiveEvent: string; trackingDeviceId: string; track: RunnerTrack }[] = [];

	for (const liveEvent of liveEvents) {
		const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);

		if (liveEvent.liveProvider === 'loggator') {
			const gpsProvider = GPS_PROVIDERS.loggator;
			const eventUrl = `${gpsProvider.apiBaseUrl}/events/${eventId}`;
			const pointsUrl = `${eventUrl}/points`;

			const pointsResponse =
				import.meta.env.MODE === 'dev-offline'
					? await fetch('http://localhost:5173/points.json')
					: await fetch(pointsUrl);

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

		if (liveEvent.liveProvider === 'gpsseuranta') {
			const gpsProvider = GPS_PROVIDERS['gps-seuranta'];
			const dataUrl = `${gpsProvider.apiBaseUrl}/${eventId}/data.lst`;
			const data = await fetch(dataUrl).then((r) => r.text());
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
	const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(liveEvent.url);

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

	if (liveEvent.liveProvider === 'gps-seuranta') {
		const gpsProvider = GPS_PROVIDERS['gps-seuranta'];
		const initUrl = `${gpsProvider.apiBaseUrl}/${eventId}/init.txt`;
		const init = await fetch(initUrl).then((r) => r.text());
		const [calibration] = parseInit(init);

		return { url: `${gpsProvider.apiBaseUrl}/${eventId}/map`, calibration };
	}

	throw new Error('Only Loggator is available in routechoice DB for the moment');
}

// TODO: fix the typing of this function
export function sortRunnersAndRunnersLegs(
	runners: RunnerWithNullableLegsAndTrack[],
	legs: LegWithRoutechoices[]
): RunnerWithNullableLegsAndTrack[] {
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

// TODO: fix the typing of this function
export function sortLegs(
	legs: LegWithRoutechoices[],
	sortRoutechoices = true
): LegWithRoutechoices[] {
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

		if (sortRoutechoices) {
			sortedLegs.push({
				...nextLeg,
				routechoices: nextLeg.routechoices.sort((routechoiceA, routechoiceB) =>
					routechoiceA.name.localeCompare(routechoiceB.name)
				)
			});
		} else {
			sortedLegs.push(nextLeg);
		}
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

export async function getRunnersWithTracksAndSortedLegs(
	sortedLegs: LegWithRoutechoices[],
	liveEvents: LiveEvent[],
	runners: RunnerWithNullableLegs[],
	fetch: Fetch
) {
	return getTracksFromLiveEvents(liveEvents, fetch)
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

/**
 * Create routechoices statistics, only for one leg when legIndex is defined
 * @param runners
 * @param legIndex
 */
export function createRoutechoiceStatistics(
	runners: RunnerWithNullableLegs[],
	legIndex?: number
): Omit<RoutechoiceStatistics, 'id'>[] {
	const routechoicesStatistics: Omit<RoutechoiceStatistics, 'id'>[] = [];

	const createOrUpdateRoutechoiceStatisticsFromRunnerLeg = (runnerLeg: RunnerLeg) => {
		const routechoiceId = runnerLeg.fkManualRoutechoice ?? runnerLeg.fkDetectedRoutechoice ?? null;
		if (routechoiceId === null) return;

		const statistics = routechoicesStatistics.find(
			(stats) => stats.fkRoutechoice === routechoiceId
		);

		if (statistics === undefined) {
			routechoicesStatistics.push({
				fkRoutechoice: routechoiceId,
				bestTime: runnerLeg.time,
				numberOfRunners: 1
			});

			return;
		}

		statistics.numberOfRunners++;

		if (statistics.bestTime > runnerLeg.time) {
			statistics.bestTime = runnerLeg.time;
		}
	};

	// I know, flatMap and filter, but Typescript doesn't infer types from filter
	for (const runner of runners) {
		if (legIndex !== undefined) {
			const runnerLeg = runner.legs[legIndex];
			if (runnerLeg === null || runnerLeg === undefined) continue;
			createOrUpdateRoutechoiceStatisticsFromRunnerLeg(runnerLeg);
			continue;
		}

		for (const runnerLeg of runner.legs) {
			if (runnerLeg === null) continue;
			createOrUpdateRoutechoiceStatisticsFromRunnerLeg(runnerLeg);
		}
	}

	return routechoicesStatistics;
}

export function addAlpha(color: string, opacity: number) {
	if (!color.startsWith('#')) throw new Error('Hexadecimal color should start with #');
	if (color.length !== 7 && color.length !== 9)
		throw new Error('Hexadecimal color should be 7 or 9 characters long');

	const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
	return color.slice(0, 7) + _opacity.toString(16).toUpperCase();
}
