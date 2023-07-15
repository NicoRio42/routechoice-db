<script lang="ts">
	import Graph from './Graph.svelte';
	import type { GraphItem } from './models/graph-item.js';
	import type { RoutechoiceWithStatistics } from '$lib/models/routechoice.model.js';

	export let legRoutechoices: RoutechoiceWithStatistics[];

	let fasestTimeGraphData: GraphItem[] = [];
	let runnerNumberGraphData: GraphItem[] = [];

	$: {
		fasestTimeGraphData = legRoutechoices
			.map((rc) => ({
				label: rc.name,
				value: rc.statistics.bestTime,
				color: rc.color
			}))
			.filter((rc) => rc.value !== 0);

		runnerNumberGraphData = legRoutechoices
			.map((rc) => ({
				label: rc.name,
				value: rc.statistics.numberOfRunners,
				color: rc.color
			}))
			.filter((rc) => rc.value !== 0);
	}
</script>

<h3>Fastest time</h3>

<Graph data={fasestTimeGraphData} suffix={' s'} />

<h3>Runners per routechoice</h3>

<Graph data={runnerNumberGraphData} />
