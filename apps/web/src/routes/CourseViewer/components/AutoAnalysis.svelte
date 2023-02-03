<script lang="ts">
  import type Runner from "../../../../shared/o-utils/models/runner";
  import LineString from "./LineString.svelte";
  import { cropTrackFromLegNumber } from "./utils";

  export let runners: Runner[];
  export let selectedRunners: string[];
  export let legNumber: number;

  let firstRunner: Runner;
  let secondRunner: Runner;

  let firstRunnerCoords: number[][] = [];
  let secondRunnerCoords: number[][] = [];
  let lines: number[][][] = [];

  $: {
    const runnersWithTracks = runners.filter((r) => r.track !== null);

    firstRunner =
      runners.find((r) => r.id === selectedRunners[0]) ?? runnersWithTracks[0];

    secondRunner =
      runners.find((r) => r.id === selectedRunners[1]) ?? runnersWithTracks[1];

    if (firstRunner !== undefined && secondRunner !== undefined) {
      firstRunnerCoords = cropTrackFromLegNumber(firstRunner, legNumber);
      secondRunnerCoords = cropTrackFromLegNumber(secondRunner, legNumber);

      if (firstRunnerCoords.length < secondRunnerCoords.length) {
        lines = firstRunnerCoords.map((point, i) => [
          point,
          secondRunnerCoords[i],
        ]);
      } else {
        lines = secondRunnerCoords.map((point, i) => [
          point,
          firstRunnerCoords[i],
        ]);
      }
    }
  }
</script>

{#if firstRunner !== undefined && secondRunner !== undefined}
  <LineString color="blue" coords={firstRunnerCoords} width={7} />

  <LineString color="red" coords={secondRunnerCoords} width={7} />

  {#each lines as line, index}
    <LineString
      color={index % 2 === 0 ? "red" : "blue"}
      coords={line}
      width={2}
    />
  {/each}
{/if}
