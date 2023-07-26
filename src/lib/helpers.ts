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
			const pointsResponse = await fetch(pointsUrl);
			// const pointsResponse = await fetch('http://localhost:5173/points.json');

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
		const eventResponse = await fetch(eventUrl);
		// const eventResponse = await fetch('http://localhost:5173/20220622meylan.json');

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

export function sortRunnersLegs(
	runners: RunnerWithNullableLegsAndTrack[],
	legs: LegWithRoutechoices[]
): RunnerWithNullableLegsAndTrack[] {
	return runners.map((runner) => {
		const runnerLegs: (RunnerLeg | null)[] = [];

		legs.forEach((leg) => {
			const runnerLeg = runner.legs.find((l) => leg.id === l?.fkLeg);
			if (runnerLeg === undefined) runnerLegs.push(null);
			else runnerLegs.push(runnerLeg);
		});

		return { ...runner, legs: runnerLegs };
	});
}

export function sortLegs(legs: LegWithRoutechoices[]): LegWithRoutechoices[] {
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
	runners: RunnerWithNullableLegs[]
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
		.then((runners) => sortRunnersLegs(runners, sortedLegs));
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
