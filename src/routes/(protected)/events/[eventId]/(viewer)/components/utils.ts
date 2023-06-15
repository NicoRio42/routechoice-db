import { transform } from 'ol/proj.js';
import type { Runner } from 'orienteering-js/models';
import { getLineStringLength } from 'orienteering-js/utils';

export function cropTrackFromLegNumber(runner: Runner, legNumber: number): number[][] {
	const runnerLeg = runner.legs[legNumber - 1];
	if (runnerLeg === null) return [];
	const startTime = runner.startTime + runnerLeg.timeOverall - runnerLeg.time;
	const finishTime = runner.startTime + runnerLeg.timeOverall;

	const runnerrack = runner.track!;
	let startIndex = runnerrack.times.findIndex((time) => time >= startTime + runner.timeOffset);
	if (startIndex === -1) startIndex = 0;

	let finishIndex = runnerrack.times.findIndex((time) => time >= finishTime + runner.timeOffset);

	if (finishIndex === -1) finishIndex = runnerrack.times.length - 1;

	const cutCoords: number[][] = [];

	for (let i = startIndex; i <= finishIndex; i++) {
		cutCoords.push(transform([runnerrack.lons[i], runnerrack.lats[i]], 'EPSG:4326', 'EPSG:3857'));
	}

	return cutCoords;
}

export function getStandardCordsAndLengthFromLineStringFlatCordinates(
	flatCoordinates: number[]
): [[number, number][], number] {
	const coords: [number, number][] = [];
	const limit = flatCoordinates.length;

	for (let i = 0; i < limit; i += 2) {
		const point = transform([flatCoordinates[i], flatCoordinates[i + 1]], 'EPSG:3857', 'EPSG:4326');

		coords.push([point[1], point[0]]);
	}

	const length = getLineStringLength(coords);

	return [coords, length];
}

export function addAlpha(color: string, opacity: number) {
	if (!color.startsWith('#')) throw new Error('Hexadecimal color should start with #');
	if (color.length !== 7 && color.length !== 9)
		throw new Error('Hexadecimal color should be 7 or 9 characters long');

	const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
	return color.slice(0, 7) + _opacity.toString(16).toUpperCase();
}
