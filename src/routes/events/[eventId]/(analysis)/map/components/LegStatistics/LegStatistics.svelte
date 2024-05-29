<script lang="ts">
	import Graph from './Graph.svelte';
	import type { GraphItem } from './models/graph-item.js';
	import type { RoutechoiceWithStatistics } from '$lib/models/routechoice.model.js';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model.js';

	export let sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[];
	export let legRoutechoices: RoutechoiceWithStatistics[];

	let fasestTimeGraphData: GraphItem[] = [];
	let firstQuarterTimeAverageGraphData: GraphItem[] = [];
	let runnerNumberGraphData: GraphItem[] = [];

	// Lazily computing statistics for now
	// TODO: store statistics properly in database so it can be used in a dashboard

	function getRoutechoiceRunners(
		routechoiceId: string,
		sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[]
	) {
		return sortedRunnersWithOneLeg.filter((r) => {
			const leg = r.legs[0];
			if (leg === undefined || leg === null) return false;
			if (leg?.fkManualRoutechoice === routechoiceId) return true;
			return leg.fkDetectedRoutechoice === routechoiceId;
		});
	}

	$: {
		fasestTimeGraphData = legRoutechoices.map((rc) => {
			const routechoiceRunners = getRoutechoiceRunners(rc.id, sortedRunnersWithOneLeg);

			return {
				label: rc.name,
				value: routechoiceRunners[0]?.legs[0]?.time ?? null,
				color: rc.color
			};
		});

		firstQuarterTimeAverageGraphData = legRoutechoices.map((rc) => {
			const routechoiceRunners = getRoutechoiceRunners(rc.id, sortedRunnersWithOneLeg);

			if (
				routechoiceRunners.length === 0 ||
				routechoiceRunners[0].legs[0] === null ||
				routechoiceRunners[0].legs[0].time === null
			) {
				return {
					label: rc.name,
					value: null,
					color: rc.color
				};
			}

			const firstQuarterLength = Math.ceil(routechoiceRunners.length / 4);
			let sum = 0;
			let divider = 0;

			for (let i = 0; i < firstQuarterLength; i++) {
				const leg = routechoiceRunners[i].legs[0];
				if (leg === null) continue;
				sum += leg.time;
				divider++;
			}

			return {
				label: rc.name,
				value: Math.round(sum / divider),
				color: rc.color
			};
		});

		runnerNumberGraphData = legRoutechoices.map((rc) => {
			const routechoiceRunners = getRoutechoiceRunners(rc.id, sortedRunnersWithOneLeg);

			return {
				label: rc.name,
				value: routechoiceRunners.length,
				color: rc.color
			};
		});
	}
</script>

<h3>Fastest time</h3>

<Graph data={fasestTimeGraphData} suffix={' s'} />

<h3>Average of first 25%</h3>

<Graph data={firstQuarterTimeAverageGraphData} suffix={' s'} />

<h3>Runners per routechoice</h3>

<Graph data={runnerNumberGraphData} />
