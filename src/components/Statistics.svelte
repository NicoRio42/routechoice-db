<script lang="ts">
  import Graph from "./Graph.svelte";

  export let splitTimes;
  export let legNumber;

  let fasestTimeGraphData = [];
  let runnerNumberGraphData = [];

  $: {
    if (splitTimes.routeChoicesStatistics.length !== 0) {
      const statistics = splitTimes.routeChoicesStatistics[legNumber - 1];
      const formattedStatistics = Object.keys(statistics).map(
        (routechoiceName) => ({
          ...statistics[routechoiceName],
          name: routechoiceName,
        })
      );

      fasestTimeGraphData = formattedStatistics
        .map((stat) => ({
          label: stat.name,
          value: stat.fastestTime,
          color: stat.color,
        }))
        .sort(sortString);

      runnerNumberGraphData = formattedStatistics
        .map((stat) => ({
          label: stat.name,
          value: stat.numberOfRunners,
          color: stat.color,
        }))
        .sort(sortString);
    }
  }

  function sortString(a, b): number {
    return a.label.localeCompare(b.label);
  }
</script>

<h3>Fastest Time</h3>

<Graph data={fasestTimeGraphData} suffix={" s"} />

<h3>Number of runners</h3>

<Graph data={runnerNumberGraphData} />
