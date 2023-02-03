import { transform } from "ol/proj";
import type Runner from "../../../../shared/o-utils/models/runner";

export function cropTrackFromLegNumber(
  runner: Runner,
  legNumber: number
): number[][] {
  const runnerLeg = runner.legs[legNumber - 1];
  if (runnerLeg === null) return [];
  const startTime = runner.startTime + runnerLeg.timeOverall - runnerLeg.time;
  const finishTime = runner.startTime + runnerLeg.timeOverall;

  const runnerrack = runner.track!;
  let startIndex = runnerrack.times.findIndex((time) => time >= startTime);
  if (startIndex === -1) startIndex = 0;

  let finishIndex = runnerrack.times.findIndex((time) => time >= finishTime);

  if (finishIndex === -1) finishIndex = runnerrack.times.length - 1;

  const cutCoords: number[][] = [];

  for (let i = startIndex; i <= finishIndex; i++) {
    cutCoords.push(
      transform(
        [runnerrack.lons[i], runnerrack.lats[i]],
        "EPSG:4326",
        "EPSG:3857"
      )
    );
  }

  return cutCoords;
}
