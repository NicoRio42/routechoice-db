import type { EventWithLiveEventsRunnersLegsAndControlPoints } from '$lib/models/event.model.js';
import type { LegWithRoutechoices } from '$lib/models/leg.model';
import type {
	RunnerWithLegsAndTracks,
	RunnerWithNullableLegsAndTrack
} from '$lib/models/runner.model';
import { transform, transformExtent } from 'ol/proj.js';
import type { CourseMap } from 'orienteering-js/models';
import type { z } from 'zod';
import type { runnersTracksColorsEnum } from './settings-store';

export function computeFitBoxAndAngleFromLegNumber(
	legNumber: number,
	event: EventWithLiveEventsRunnersLegsAndControlPoints,
	eventMap: CourseMap
): [[number, number, number, number], number] {
	const leg = event.legs[legNumber - 1];

	if (leg === undefined) {
		return computeFitBoxAndAngleFromCourseMap(eventMap);
	}

	const startControl = event.controlPoints.find(
		(control) => control.id === leg.fkStartControlPoint
	);
	const finishControl = event.controlPoints.find(
		(control) => control.id === leg.fkFinishControlPoint
	);

	if (startControl === undefined || finishControl === undefined) {
		return computeFitBoxAndAngleFromCourseMap(eventMap);
	}

	const routechoicesLatitudes = leg.routechoices.flatMap((r) => r.latitudes.split(';').map(Number));

	const routechoicesLongitudes = leg.routechoices.flatMap((r) =>
		r.longitudes.split(';').map(Number)
	);

	const minLat = Math.min(startControl.latitude, finishControl.latitude, ...routechoicesLatitudes);
	const maxLat = Math.max(startControl.latitude, finishControl.latitude, ...routechoicesLatitudes);

	const minLon = Math.min(
		startControl.longitude,
		finishControl.longitude,
		...routechoicesLongitudes
	);

	const maxLon = Math.max(
		startControl.longitude,
		finishControl.longitude,
		...routechoicesLongitudes
	);

	const extend = transformExtent([minLon, minLat, maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');

	const startControlWebMarcator = transform(
		[startControl.longitude, startControl.latitude],
		'EPSG:4326',
		'EPSG:3857'
	);

	const finishControlWebMercator = transform(
		[finishControl.longitude, finishControl.latitude],
		'EPSG:4326',
		'EPSG:3857'
	);

	const deltaX = finishControlWebMercator[0] - startControlWebMarcator[0];
	const deltaY = finishControlWebMercator[1] - startControlWebMarcator[1];

	const newAngle = -Math.atan(deltaX / deltaY) - (deltaY > 0 ? 0 : Math.PI);

	return [extend as [number, number, number, number], newAngle];
}

function computeFitBoxAndAngleFromCourseMap(
	eventMap: CourseMap
): [[number, number, number, number], number] {
	const minLat = Math.min(
		eventMap.calibration[0].gps.lat,
		eventMap.calibration[1].gps.lat,
		eventMap.calibration[2].gps.lat
	);
	const maxLat = Math.max(
		eventMap.calibration[0].gps.lat,
		eventMap.calibration[1].gps.lat,
		eventMap.calibration[2].gps.lat
	);
	const minLon = Math.min(
		eventMap.calibration[0].gps.lon,
		eventMap.calibration[1].gps.lon,
		eventMap.calibration[2].gps.lon
	);
	const maxLon = Math.max(
		eventMap.calibration[0].gps.lon,
		eventMap.calibration[1].gps.lon,
		eventMap.calibration[2].gps.lon
	);

	const extend = transformExtent([minLon, minLat, maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');

	return [extend as [number, number, number, number], 0];
}

export function getLegNumberFromSearchParams(searchParams: URLSearchParams): number {
	const legNumberFromParams = searchParams.get('legNumber');
	if (legNumberFromParams === null) return 1;
	const parsedLegNumber = parseInt(legNumberFromParams, 10);
	if (isNaN(parsedLegNumber)) return 1;

	return parsedLegNumber;
}

function getColorFromTime(time: number, fastestTime: number, slowestTime: number) {
	const hue =
		slowestTime === fastestTime
			? 120
			: Math.round((1 - (time - fastestTime) / (slowestTime - fastestTime)) * 120);

	return `hsl(${hue}deg 100% 50%)`;
}

export function getSelectedRunnersWithCurrentLegOnlyAndTracks(
	runners: RunnerWithNullableLegsAndTrack[],
	selectedLeg: LegWithRoutechoices,
	selectedRunnersIds: string[],
	runnersTracksColors: z.infer<typeof runnersTracksColorsEnum>
): RunnerWithLegsAndTracks[] {
	const selectedRunnersWithCurrentLegOnly = runners
		.filter(({ id }) => selectedRunnersIds.includes(id))
		.map((runner) => ({
			...runner,
			legs: runner.legs.filter((runnerLeg) => selectedLeg.id === runnerLeg?.fkLeg)
		}))
		.filter(
			(runner): runner is RunnerWithLegsAndTracks =>
				runner.legs.length !== 0 && runner.track !== null
		)
		.sort((runner1, runner2) => runner1.legs[0].time - runner2.legs[0].time);

	if (runnersTracksColors === 'original' || selectedRunnersWithCurrentLegOnly.length === 0) {
		return selectedRunnersWithCurrentLegOnly;
	}

	if (runnersTracksColors === 'routechoice') {
		return selectedRunnersWithCurrentLegOnly.map((runner) => {
			const fkRoutechoice =
				runner.legs[0].fkManualRoutechoice ?? runner.legs[0].fkDetectedRoutechoice;
			const routechoice = selectedLeg.routechoices.find((r) => r.id === fkRoutechoice);
			const color = routechoice?.color ?? 'grey';

			return {
				...runner,
				track: {
					...runner.track,
					color
				}
			};
		});
	}

	const fastestTime = selectedRunnersWithCurrentLegOnly[0].legs[0].time;
	const slowestTime =
		selectedRunnersWithCurrentLegOnly[selectedRunnersWithCurrentLegOnly.length - 1].legs[0].time;

	return selectedRunnersWithCurrentLegOnly.map((runner) => ({
		...runner,
		track: {
			...runner.track,
			color: getColorFromTime(runner.legs[0].time, fastestTime, slowestTime)
		}
	}));
}
