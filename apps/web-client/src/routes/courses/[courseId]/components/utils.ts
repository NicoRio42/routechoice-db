import { transform } from 'ol/proj';
import type Runner from '$lib/o-utils/models/runner';
import { getLineStringLength } from '$lib/o-utils/utils/distance-helpers';

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
