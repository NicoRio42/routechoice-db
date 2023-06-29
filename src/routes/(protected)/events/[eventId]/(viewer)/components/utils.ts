import { transform } from 'ol/proj.js';
import { getLineStringLength } from 'orienteering-js/utils';
import type { Runner } from '../models/runner.model.js';
import type { RunnerLeg } from '$lib/server/db/schema.js';
import type { RunnerTrack } from 'orienteering-js/models';

export function cropTrackFromLegNumber(
	runnerLeg: RunnerLeg,
	track: RunnerTrack,
	startTime: Date,
	timeOffset: number
): number[][] {
	const finishTime = startTime.getTime() / 1000 + runnerLeg.timeOverall;
	const startTimeInSeconds = finishTime - runnerLeg.time;

	let startIndex = track.times.findIndex((time) => time >= startTimeInSeconds + timeOffset);
	if (startIndex === -1) startIndex = 0;

	let finishIndex = track.times.findIndex((time) => time >= finishTime + timeOffset);

	if (finishIndex === -1) finishIndex = track.times.length - 1;

	const cutCoords: number[][] = [];

	for (let i = startIndex; i <= finishIndex; i++) {
		cutCoords.push(transform([track.lons[i], track.lats[i]], 'EPSG:4326', 'EPSG:3857'));
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
