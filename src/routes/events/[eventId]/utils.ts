import { transform, transformExtent } from 'ol/proj.js';
import { ModesEnum } from './models/modes.enum.js';
import type { EventWithLiveEventsRunnersLegsAndControlPoints } from '$lib/models/event.model.js';
import type { CourseMap } from 'orienteering-js/models';

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

export function getModeFromSearchParams(searchParams: URLSearchParams): ModesEnum {
	const modeFromParams = searchParams.get('mode');
	if (modeFromParams === ModesEnum.DRAW) return ModesEnum.DRAW;

	return ModesEnum.ANALYSIS;
}

export function getLegNumberFromSearchParams(searchParams: URLSearchParams): number {
	const legNumberFromParams = searchParams.get('legNumber');
	if (legNumberFromParams === null) return 1;
	const parsedLegNumber = parseInt(legNumberFromParams, 10);
	if (isNaN(parsedLegNumber)) return 1;

	return parsedLegNumber;
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
