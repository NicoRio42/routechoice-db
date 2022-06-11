<script>
  import course from "../../stores/course";
  import selectedLeg from "../../stores/selected-leg";

  import {
    rankToCSSClass,
    secondsToPrettyTime,
    fullNameToShortName,
  } from "./utils";

  let legSplitTimes = [];

  $: {
    if ($course?.splitTimes !== undefined && $selectedLeg !== undefined) {
      legSplitTimes = $course.splitTimes.runners.map((runner) => {
        let returnedRunner = { ...runner };
        let leg = runner.legs[$selectedLeg - 1];
        delete returnedRunner.legs;
        returnedRunner.leg = leg;
        return returnedRunner;
      });

      console.log(legSplitTimes);

      legSplitTimes = legSplitTimes.sort(
        (runner1, runner2) => runner1.leg.time - runner2.leg.time
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
  {#each legSplitTimes as runner}
    <tr>
      <td data-tooltip={`${runner.firstName} ${runner.lastName}`}>
        {fullNameToShortName(runner.firstName, runner.lastName)}
      </td>

      <td class={runner.leg.isMistake ? "mistake" : ""}>
        <div
          class="tooltip-container {rankToCSSClass(runner.leg.rankSplit)}"
          data-tooltip={`+ ${secondsToPrettyTime(runner.leg.timeBehindSplit)}`}
        >
          {`${secondsToPrettyTime(runner.leg.time)} (${runner.leg.rankSplit})`}
        </div>

        {#if runner.leg.timeOverall !== null}
          <div
            class="tooltip-container {rankToCSSClass(runner.leg.rankOverall)}"
            data-tooltip={`+ ${secondsToPrettyTime(
              runner.leg.timeBehindOverall
            )}`}
          >
            {`${secondsToPrettyTime(runner.leg.timeOverall)} (${
              runner.leg.rankOverall
            })`}
          </div>
        {/if}
      </td>

      <td class="right">
        {#if runner.leg.routeChoice}
          <strong style:color={`#${runner.leg.routeChoice.color}`}
            >{runner.leg.routeChoice.name}</strong
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
