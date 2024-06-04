import type { RunnerLeg } from '$lib/server/db/models.js';
import { transform } from 'ol/proj.js';
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
