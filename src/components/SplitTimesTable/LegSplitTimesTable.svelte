<script>
  import {
    rankToCSSClass,
    secondsToPrettyTime,
    fullNameToShortName,
  } from "./utils";

  export let splitTimes;
  export let legNumber;

  let legSplitTimes;

  $: {
    legSplitTimes = splitTimes.runners.map((runner) => {
      let returnedRunner = { ...runner };
      let leg = runner.legs[legNumber - 1];
      delete returnedRunner.legs;
      returnedRunner.leg = leg;
      return returnedRunner;
    });

    legSplitTimes = legSplitTimes.sort(
      (runner1, runner2) => runner1.leg.time - runner2.leg.time
    );
  }
</script>

<table>
  <thead>
    <tr>
      <th class="sticky-header">Runners</th>

      <th class="sticky-header">Time</th>

      <th class="sticky-header">Routechoice</th>
    </tr>
  </thead>
  {#each legSplitTimes as runner}
    <tr>
      <td>
        <div class="tooltip-container">
          {fullNameToShortName(runner.firstName, runner.lastName)}
          <span class="tooltip">
            {`${runner.firstName} ${runner.lastName}`}
          </span>
        </div>
      </td>

      <td class={runner.leg.isMistake ? "mistake" : ""}>
        <div class="tooltip-container {rankToCSSClass(runner.leg.rankSplit)}">
          {`${secondsToPrettyTime(runner.leg.time)} (${runner.leg.rankSplit})`}
          <span class="tooltip">
            <div>
              {`+ ${secondsToPrettyTime(runner.leg.timeBehindSplit)}`}
            </div>

            {#if runner.leg.isMistake === true}
              <div>
                {`Time loss: ${secondsToPrettyTime(runner.leg.timeLost)}`}
              </div>
            {/if}
          </span>
        </div>

        {#if runner.leg.timeOverall !== null}
          <div
            class="tooltip-container {rankToCSSClass(runner.leg.rankOverall)}"
          >
            {`${secondsToPrettyTime(runner.leg.timeOverall)} (${
              runner.leg.rankOverall
            })`}

            <span class="tooltip"
              >{`+ ${secondsToPrettyTime(runner.leg.timeBehindOverall)}`}</span
            >
          </div>
        {/if}
      </td>

      <td>A</td>
    </tr>
  {/each}
  <tbody />
</table>

<style>
  .table-container {
    width: 100%;
    height: 100%;
    overflow: scroll;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    display: table;
  }

  table th.sticky-header {
    background-color: #38383d;
    color: white;
    font-weight: normal;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  table tr:nth-child(odd) td {
    background-color: #fff;
  }

  table tr:nth-child(even) td {
    background-color: #f1f1f1;
  }

  table td,
  table th {
    padding: 8px 8px;
    display: table-cell;
    text-align: right;
    vertical-align: top;
    white-space: nowrap;
  }

  table th:first-child,
  table td:first-child {
    padding-left: 16px;
    text-align: left;
  }

  tbody tr:hover td {
    background-color: #ccc;
  }

  tbody {
    z-index: 0;
  }

  .tooltip-container {
    position: relative;
  }

  .tooltip-container:hover .tooltip {
    visibility: visible;
    opacity: 1;
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
</style>
