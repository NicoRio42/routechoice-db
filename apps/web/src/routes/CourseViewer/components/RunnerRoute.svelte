<script lang="ts">
  import type { RunnerTrack } from "../../../../shared/o-utils/models/runner";
  import type Runner from "../../../../shared/o-utils/models/runner";
  import Polyline from "./Polyline.svelte";

  export let runner: Runner;
  export let controlNumber: number;

  let coords: [number, number][] = [];

  $: coords = computeCoordsFromRunnerTrackAndControlNumber(
    runner.track,
    controlNumber
  );

  let color = pickColor();

  function pickColor() {
    return "";
  }

  function computeCoordsFromRunnerTrackAndControlNumber(
    runnerTrack: RunnerTrack | null,
    controlNumber: number
  ) {
    return [];
  }
</script>

<Polyline {coords} {color} />
