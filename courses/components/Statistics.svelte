<script>
  import course from "../stores/course-data";
  import selectedLeg from "../stores/selected-leg";
  import Graph from "./Graph.svelte";

  let fasestTimeGraphData = [];
  let runnerNumberGraphData = [];

  $: {
    if ($course?.splitTimes?.routeChoicesStatistics) {
      const statistics =
        $course.splitTimes.routeChoicesStatistics[$selectedLeg - 1];
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

  /**
   *
   * @param a
   * @param b
   * @returns {number}
   */
  function sortString(a, b) {
    return a.label.localeCompare(b.label);
  }
</script>

<h3>Fastest time</h3>

<Graph data={fasestTimeGraphData} suffix={" s"} />

<h3>Number of runners</h3>

<Graph data={runnerNumberGraphData} />
