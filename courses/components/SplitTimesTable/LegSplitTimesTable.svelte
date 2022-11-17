<script lang="ts">
  import type Runner from "shared/o-utils/models/runner";
  import courseData from "../../stores/course-data";
  import selectedLeg from "../../stores/selected-leg";

  import {
    fullNameToShortName,
    rankToCSSClass,
    secondsToPrettyTime,
  } from "./utils";

  let sortedRunnersWithOneLeg: Runner[] = [];

  $: {
    if ($selectedLeg !== null) {
      const clonedRunnerWithOneLeg = structuredClone($courseData.runners).map(
        (runner) => ({
          ...runner,
          legs: runner.legs.filter((l, i) => i + 1 === $selectedLeg),
        })
      );

      sortedRunnersWithOneLeg = clonedRunnerWithOneLeg.sort(
        (runner1, runner2) => {
          const runner1Leg = runner1.legs[0];
          const runner2Leg = runner2.legs[0];

          if (runner1Leg !== null && runner2Leg !== null) {
            return runner1Leg.time - runner2Leg.time;
          }

          if (runner1Leg === null && runner2Leg !== null) {
            return 1;
          }

          if (runner1Leg !== null && runner2Leg === null) {
            return -1;
          }

          return 0;
        }
      );
    }
  }
</script>

<table>
  <thead>
    <tr>
      <th class="sticky-header">Runners</th>

      <th class="sticky-header">Time</th>

      <th class="sticky-header right">RC</th>
    </tr>
  </thead>
  {#each sortedRunnersWithOneLeg as runner}
    <tr>
      <td data-tooltip={`${runner.firstName} ${runner.lastName}`}>
        {fullNameToShortName(runner.firstName, runner.lastName)}
      </td>

      <td class:mistake={runner.legs[0]?.isMistake}>
        <div
          class="tooltip-container {rankToCSSClass(runner.legs[0]?.rankSplit)}"
          data-tooltip={`+ ${secondsToPrettyTime(
            runner.legs[0]?.timeBehindSplit
          )}`}
        >
          {`${secondsToPrettyTime(runner.legs[0]?.time)} (${
            runner.legs[0]?.rankSplit
          })`}
        </div>

        {#if runner.legs[0]?.timeOverall !== null}
          <div
            class="tooltip-container {rankToCSSClass(
              runner.legs[0]?.rankOverall
            )}"
            data-tooltip={`+ ${secondsToPrettyTime(
              runner.legs[0]?.timeBehindOverall
            )}`}
          >
            {`${secondsToPrettyTime(runner.legs[0]?.timeOverall)} (${
              runner.legs[0]?.rankOverall
            })`}
          </div>
        {/if}
      </td>

      <td class="right">
        {#if runner.legs[0]?.detectedRouteChoice}
          <strong style:color={`#${runner.legs[0]?.detectedRouteChoice.color}`}
            >{runner.legs[0]?.detectedRouteChoice.name}</strong
          >
        {/if}
      </td>
    </tr>
  {/each}
  <tbody />
</table>

<style>
  table {
    font-size: smaller;
  }

  table th.sticky-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
  }

  .tooltip-container,
  .tooltip {
    white-space: nowrap;
  }

  .tooltip-container {
    position: relative;
  }

  [data-tooltip] {
    border-bottom: none;
  }

  .tooltip {
    z-index: 1;
    display: inline-block;
    position: absolute;
    left: 10%;
    top: 100%;
    color: #fff;
    background-color: #616161;
    padding-left: 8px;
    padding-right: 8px;
    text-align: center;
    border-radius: 4px;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s, opacity 0.5s linear;
  }

  .tooltip-top {
    top: auto;
    bottom: 100%;
  }

  .first {
    color: #f44336;
  }

  .second {
    color: #4caf50;
  }

  .third {
    color: #2196f3;
  }

  table tr td.mistake {
    background-color: #ffdddd;
  }

  .right {
    text-align: end;
  }
</style>
