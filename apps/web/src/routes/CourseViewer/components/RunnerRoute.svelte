<script lang="ts">
  import { transform } from "ol/proj";
  import type Runner from "../../../../shared/o-utils/models/runner";
  import type { RunnerTrack } from "../../../../shared/o-utils/models/runner";
  import LineString from "./LineString.svelte";

  export let runner: Runner;
  export let legNumber: number;

  let coords: number[][] = [];

  $: coords = computeCoordsFromRunnerTrackAndLegNumber(
    runner.track!,
    legNumber
  );

  let color = pickColor();

  function pickColor() {
    return "";
  }

  function computeCoordsFromRunnerTrackAndLegNumber(
    runnerTrack: RunnerTrack,
    legNumber: number
  ): number[][] {
    const runnerLeg = runner.legs[legNumber - 1];
    if (runnerLeg === null) return [];
    const startTime = runner.startTime + runnerLeg.timeOverall - runnerLeg.time;
    const finishTime = runner.startTime + runnerLeg.timeOverall;

    let startIndex = runnerTrack.times.findIndex((time) => time >= startTime);
    if (startIndex === -1) startIndex = 0;

    let finishIndex = runnerTrack.times.findIndex((time) => time >= finishTime);

    if (finishIndex === -1) finishIndex = runnerTrack.times.length - 1;

    const cutCoords: number[][] = [];

    for (let i = startIndex; i <= finishIndex; i++) {
      cutCoords.push(
        transform(
          [runnerTrack.lons[i], runnerTrack.lats[i]],
          "EPSG:4326",
          "EPSG:3857"
        )
      );
    }

    return cutCoords;
  }
</script>

<LineString
  {coords}
  color={`#${runner.track?.color}`}
  width={5}
  text={runner.lastName}
/>
