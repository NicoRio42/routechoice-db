import { transform, transformExtent } from 'ol/proj.js';
import { ModesEnum } from './models/modes.enum.js';
import type { EventWithLiveEventsRunnersLegsAndControlPoints } from '$lib/models/event.model.js';

export function computeFitBoxAndAngleFromLegNumber(
	legNumber: number,
	event: EventWithLiveEventsRunnersLegsAndControlPoints
): [[number, number, number, number], number] {
	const leg = event.legs[legNumber - 1];
	if (leg === undefined) throw new Error('Cannot find leg');

	const startControl = event.controlPoints.find(
		(control) => control.id === leg.fkStartControlPoint
	);
	const finishControl = event.controlPoints.find(
		(control) => control.id === leg.fkFinishControlPoint
	);

	if (startControl === undefined || finishControl === undefined) {
		throw new Error('Control point not found for the given leg.');
	}

	const minLat = Math.min(startControl.latitude, finishControl.latitude);
	const maxLat = Math.max(startControl.latitude, finishControl.latitude);
	const minLon = Math.min(startControl.longitude, finishControl.longitude);
	const maxLon = Math.max(startControl.longitude, finishControl.longitude);

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
