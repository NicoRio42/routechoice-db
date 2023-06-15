import { transform, transformExtent } from 'ol/proj.js';
import type { CourseData } from 'orienteering-js/models';
import { ModesEnum } from './models/modes.enum.js';

export function computeFitBoxAndAngleFromLegNumber(
	legNumber: number,
	courseData: CourseData
): [[number, number, number, number], number] {
	const leg = courseData.legs[legNumber - 1];
	if (leg === undefined) throw new Error('Cannot find leg');

	const finishControl = courseData.course.find((control) => control.code === leg.finishControlCode);

	if (finishControl === undefined) throw new Error('Cannot find finish control');

	const minLat = Math.min(leg.startLat, finishControl.lat);
	const maxLat = Math.max(leg.startLat, finishControl.lat);
	const minLon = Math.min(leg.startLon, finishControl.lon);
	const maxLon = Math.max(leg.startLon, finishControl.lon);

	const extend = transformExtent([minLon, minLat, maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');

	const startControlWebMarcator = transform([leg.startLon, leg.startLat], 'EPSG:4326', 'EPSG:3857');

	const finishControlWebMercator = transform(
		[finishControl.lon, finishControl.lat],
		'EPSG:4326',
		'EPSG:3857'
	);

	const deltaX = finishControlWebMercator[0] - startControlWebMarcator[0];
	const deltaY = finishControlWebMercator[1] - startControlWebMarcator[1];

	const newAngle = -Math.atan(deltaX / deltaY) - (deltaY > 0 ? 0 : Math.PI);

	return [extend as [number, number, number, number], newAngle];
}

export function getModeFromSearchParams(searchParams: URLSearchParams): ModesEnum {
	const modeFromParams = searchParams.get('mode');
	if (modeFromParams === ModesEnum.DRAW) return ModesEnum.DRAW;

	return ModesEnum.ANALYSIS;
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
