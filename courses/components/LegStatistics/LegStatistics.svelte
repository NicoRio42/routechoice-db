<script lang="ts">
  import courseData from "../../stores/course-data";
  import selectedLeg from "../../stores/selected-leg";
  import Graph from "./Graph.svelte";
  import type { GraphItem } from "./models/graph-item";

  let fasestTimeGraphData: GraphItem[] = [];
  let runnerNumberGraphData: GraphItem[] = [];

  $: {
    if ($selectedLeg !== null) {
      const leg = $courseData.legs[$selectedLeg - 1];

      fasestTimeGraphData = leg.routechoices
        .map((rc) => ({
          label: rc.name,
          value: rc.statistics?.fastestTime ?? -1,
          color: rc.color,
        }))
        .filter((rc) => rc.value !== -1);

      runnerNumberGraphData = leg.routechoices
        .map((rc) => ({
          label: rc.name,
          value: rc.statistics?.numberOfRunners ?? -1,
          color: rc.color,
        }))
        .filter((rc) => rc.value !== -1);
    }
  }
</script>

<h3>Fastest time</h3>

<Graph data={fasestTimeGraphData} suffix={" s"} />

<h3>Runners per routechoice</h3>

<Graph data={runnerNumberGraphData} />
