<script lang="ts">
  import type { RunnerTrack } from "../../../../shared/o-utils/models/runner";
  import type Runner from "../../../../shared/o-utils/models/runner";
  import LineString from "./LineString.svelte";

  export let runner: Runner;
  export let legNumber: number;

  let coords: [number, number][] = [];

  $: coords = computeCoordsFromRunnerTrackAndLegNumber(runner.track, legNumber);

  let color = pickColor();

  function pickColor() {
    return "";
  }

  function computeCoordsFromRunnerTrackAndLegNumber(
    runnerTrack: RunnerTrack | null,
    legNumber: number
  ) {
    return [];
  }
</script>

<LineString {coords} {color} />
