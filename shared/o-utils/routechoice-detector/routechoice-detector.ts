import type Leg from "../models/leg";
import type Routechoice from "../models/routechoice";
import type Runner from "../models/runner";
import type { RunnerTrack } from "../models/runner";
import { isNotNullRunnerLeg } from "../type-guards/runner-guards";
import { dotProduct, magnitude } from "../utils/distance-helpers";

export function detectRunnersRoutechoices(
  course: Leg[],
  runners: Runner[]
): Runner[] {
  const clonedRunners = structuredClone(runners);

  return clonedRunners.map((runner) => {
    if (runner.track === null) return runner;

    if (!isRunnerTrackConsistentWithSplitTimes(runner))
      throw new Error("Runner's track and split times are not consistents");

    return {
      ...runner,
      legs: runner.legs.map((leg, index) => {
        if (leg === null) {
          return leg;
        }

        const raceStartTime = new Date(runner.startTime);
        const raceStartTimeInSeconds = raceStartTime.getTime() / 1000;

        const startTime =
          index === 0
            ? raceStartTimeInSeconds
            : raceStartTimeInSeconds + leg.timeOverall - leg.time;

        const finishTime = raceStartTimeInSeconds + leg.timeOverall;

        const runnerLegTrack = prepareRunnerTrackForDetection(
          runner.track as RunnerTrack, // Typescript doesn't mind about my early return
          startTime,
          finishTime
        );

        return {
          ...leg,
          detectedRouteChoice:
            course[index].routechoices.length !== 0
              ? detectRoutechoice(runnerLegTrack, course[index].routechoices)
              : null,
        };
      }),
    };
  });
}

function isRunnerTrackConsistentWithSplitTimes(runner: Runner): boolean {
  if (runner.track === null) return false;

  const raceStartTime = new Date(runner.startTime);
  const raceStartTimeInSeconds = raceStartTime.getTime() / 1000;

  const lastTrackTime = runner.track.times.at(-1);

  if (lastTrackTime === undefined) return false;

  const lastCompleteLeg = structuredClone(runner.legs)
    .reverse()
    .find(isNotNullRunnerLeg);

  if (lastCompleteLeg === undefined) return false;

  const lastRunnerTimeInSeconds =
    raceStartTimeInSeconds + lastCompleteLeg.timeOverall;

  return (
    runner.track.lats.length === runner.track.lons.length &&
    runner.track.lats.length === runner.track.times.length &&
    raceStartTimeInSeconds >= runner.track.times[0] &&
    raceStartTimeInSeconds <= lastTrackTime &&
    lastRunnerTimeInSeconds >= runner.track.times[0] &&
    lastRunnerTimeInSeconds <= lastTrackTime
  );
}

const distancePointToSegment = (
  point: [number, number],
  extremity1: [number, number],
  extremity2: [number, number]
): number => {
  let r =
    dotProduct(
      [extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]],
      [point[0] - extremity1[0], point[1] - extremity1[1]]
    ) /
    Math.pow(
      magnitude([extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]]),
      2
    );

  let distance: number;

  if (r < 0) {
    distance = magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]);
  } else if (r > 1) {
    distance = magnitude([extremity2[0] - point[0], extremity2[1] - point[1]]);
  } else {
    distance = Math.sqrt(
      Math.pow(
        magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]),
        2
      ) -
        Math.pow(
          r *
            magnitude([
              extremity2[0] - extremity1[0],
              extremity2[1] - extremity1[1],
            ]),
          2
        )
    );
  }

  return distance;
};

const distancePointToPolyline = (
  point: [number, number],
  polyline: [number, number][]
): number => {
  // Initiallize distance with the distance to the fist point of the polyline
  let distance = magnitude([
    point[0] - polyline[0][0],
    point[1] - polyline[0][1],
  ]);

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
  return GPXArray.reduce(
    (acc, point) => acc + distancePointToPolyline(point, polyline),
    0
  );
};

const detectRoutechoice = (
  runnerLegTrack: [number, number][],
  routechoices: Routechoice[]
): Routechoice => {
  // Initiallisation with first routechoice
  let detectedRoutechoice = routechoices[0];
  let distance = distanceGPXToPolyline(runnerLegTrack, routechoices[0].track);

  routechoices.forEach((routechoice) => {
    let d = distanceGPXToPolyline(runnerLegTrack, routechoice.track);

    if (d < distance) {
      distance = d;
      detectedRoutechoice = routechoice;
    }
  });

  return detectedRoutechoice;
};

const prepareRunnerTrackForDetection = (
  runnerTrack: RunnerTrack,
  startTime: number,
  finishTime: number
): [number, number][] => {
  const startIndex = runnerTrack.times.findIndex((time) => time > startTime);
  const finishIndex = runnerTrack.times.findIndex((time) => time >= finishTime);

  return runnerTrack.lats
    .slice(startIndex, finishIndex)
    .map((lat, index) => [lat, runnerTrack.lons[index]]);
};
