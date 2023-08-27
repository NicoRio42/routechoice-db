import type { RunnerTrack } from 'orienteering-js/models';
import type { LegWithRoutechoiceWithParsedTrack } from './models/leg.model.js';
import type { RoutechoiceWithParsedTrack } from './models/routechoice.model.js';
import type { RunnerWithNullableLegsAndTrack } from './models/runner.model.js';

export function detectRunnersRoutechoices(
	legs: LegWithRoutechoiceWithParsedTrack[],
	runners: RunnerWithNullableLegsAndTrack[]
): RunnerWithNullableLegsAndTrack[] {
	return runners.map((runner, i) => {
		console.log('RUNNER INDEX', i);
		return detectSingleRunnerRoutechoices(legs, runner);
	});
}

export function detectRunnersRoutechoicesForASingleLeg(
	leg: LegWithRoutechoiceWithParsedTrack,
	runners: RunnerWithNullableLegsAndTrack[],
	legIndex: number
): RunnerWithNullableLegsAndTrack[] {
	return runners.map((runner) =>
		detectSingleRunnerRoutechoicesForASingleLeg(leg, runner, legIndex)
	);
}

export function detectSingleRunnerRoutechoicesForASingleLeg(
	leg: LegWithRoutechoiceWithParsedTrack,
	inputRunner: RunnerWithNullableLegsAndTrack,
	legIndex: number
): RunnerWithNullableLegsAndTrack {
	if (inputRunner.track === null) return inputRunner;
	checkIfRunnerTrackConsistentWithSplitTimes(inputRunner);
	const runner = structuredClone(inputRunner) as RunnerWithNullableLegsAndTrack;

	return {
		...runner,
		legs: runner.legs.map((runnerLeg, index) => {
			if (runnerLeg === null || index !== legIndex) {
				return runnerLeg;
			}

			const startTime =
				index === 0
					? runner.startTime.getTime() / 1000
					: runner.startTime.getTime() / 1000 + runnerLeg.timeOverall - runnerLeg.time;

			const finishTime = runner.startTime.getTime() / 1000 + runnerLeg.timeOverall;

			const runnerLegTrack = prepareRunnerTrackForDetection(
				runner.track as RunnerTrack, // Typescript doesn't mind about my early return
				startTime,
				finishTime,
				runner.timeOffset
			);

			const fkDetectedRoutechoice =
				leg.routechoices.length === 0 ? null : detectRoutechoice(runnerLegTrack, leg.routechoices);

			return {
				...runnerLeg,
				fkDetectedRoutechoice
			};
		})
	};
}

export function detectSingleRunnerRoutechoices(
	legs: LegWithRoutechoiceWithParsedTrack[],
	inputRunner: RunnerWithNullableLegsAndTrack
): RunnerWithNullableLegsAndTrack {
	if (inputRunner.track === null) return inputRunner;
	checkIfRunnerTrackConsistentWithSplitTimes(inputRunner);
	const runner = structuredClone(inputRunner) as RunnerWithNullableLegsAndTrack;

	return {
		...runner,
		legs: runner.legs.map((leg, index) => {
			if (leg === null) {
				return leg;
			}

			const startTime =
				index === 0
					? runner.startTime.getTime() / 1000
					: runner.startTime.getTime() / 1000 + leg.timeOverall - leg.time;

			const finishTime = runner.startTime.getTime() / 1000 + leg.timeOverall;

			const runnerLegTrack = prepareRunnerTrackForDetection(
				runner.track as RunnerTrack, // Typescript doesn't mind about my early return
				startTime,
				finishTime,
				runner.timeOffset
			);

			const fkDetectedRoutechoice =
				legs[index].routechoices.length === 0
					? null
					: detectRoutechoice(runnerLegTrack, legs[index].routechoices);

			return {
				...leg,
				fkDetectedRoutechoice
			};
		})
	};
}

function checkIfRunnerTrackConsistentWithSplitTimes(runner: RunnerWithNullableLegsAndTrack): void {
	if (runner.track === null) throw new Error("Runner doesn't have a track.");
	const length = runner.track.times.length;
	const lastTrackTime = runner.track.times[length - 1];
	if (lastTrackTime === undefined) throw new Error("2DRerun track's is empty.");

	const lastCompleteLeg = structuredClone(runner.legs)
		.reverse()
		.find((l) => l !== null);

	if (lastCompleteLeg === undefined || lastCompleteLeg === null) {
		console.log(runner.firstName, runner.lastName);
		throw new Error('Runner have no valid legs.');
	}

	if (runner.track.lats.length !== runner.track.lons.length)
		throw new Error("Lats and lons don't have the same length");
	if (runner.track.lats.length !== runner.track.lons.length)
		throw new Error("Lats and times don't have the same length");
}

const distancePointToSegment = (
	point: [number, number],
	extremity1: [number, number],
	extremity2: [number, number]
): number => {
	const r =
		dotProduct(
			[extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]],
			[point[0] - extremity1[0], point[1] - extremity1[1]]
		) / Math.pow(magnitude([extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]]), 2);

	let distance: number;

	if (r < 0) {
		distance = magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]);
	} else if (r > 1) {
		distance = magnitude([extremity2[0] - point[0], extremity2[1] - point[1]]);
	} else {
		distance = Math.sqrt(
			Math.pow(magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]), 2) -
				Math.pow(r * magnitude([extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]]), 2)
		);
	}

	return distance;
};

const distancePointToPolyline = (point: [number, number], polyline: [number, number][]): number => {
	// Initiallize distance with the distance to the fist point of the polyline
	let distance = magnitude([point[0] - polyline[0][0], point[1] - polyline[0][1]]);

	for (let i = 1; i < polyline.length; i++) {
		const d = distancePointToSegment(point, polyline[i - 1], polyline[i]);

		if (d < distance) {
			distance = d;
		}
	}

	return distance;
};

const distanceGPXToPolyline = (
	GPXArray: [number, number][],
	polyline: [number, number][]
): number => {
	let distance = 0;

	GPXArray.forEach((point) => (distance += distancePointToPolyline(point, polyline)));

	return distance;
};

const detectRoutechoice = (
	runnerLegTrack: [number, number][],
	routechoices: RoutechoiceWithParsedTrack[]
): string | null => {
	if (runnerLegTrack.length === 0) return null;

	// Initiallisation with first routechoice
	let detectedRoutechoice = routechoices[0];
	let distance = distanceGPXToPolyline(runnerLegTrack, routechoices[0].track);

	for (let i = 1; i < routechoices.length; i++) {
		const d = distanceGPXToPolyline(runnerLegTrack, routechoices[i].track);

		if (d < distance) {
			distance = d;
			detectedRoutechoice = routechoices[i];
		}
	}

	return detectedRoutechoice.id;
};

const prepareRunnerTrackForDetection = (
	runnerTrack: RunnerTrack,
	startTime: number,
	finishTime: number,
	timeOffset: number
): [number, number][] => {
	let startIndex = runnerTrack.times.findIndex((time) => time >= startTime + timeOffset);

	let finishIndex = runnerTrack.times.findIndex((time) => time >= finishTime + timeOffset);

	if (startIndex === -1 && finishIndex === -1) return [];
	if (startIndex === -1) startIndex = 0;
	if (finishIndex === -1) finishIndex = runnerTrack.times.length - 1;

	return runnerTrack.lats
		.slice(startIndex, finishIndex)
		.map((lat, index) => [lat, runnerTrack.lons[startIndex + index]]);
};

const magnitude = (vector: [number, number]): number => {
	return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
};

const dotProduct = (vector1: [number, number], vector2: [number, number]) => {
	return vector1[0] * vector2[0] + vector1[1] * vector2[1];
};
