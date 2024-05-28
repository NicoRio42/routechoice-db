<script lang="ts">
	import Graph from './Graph.svelte';
	import type { GraphItem } from './models/graph-item.js';
	import type { RoutechoiceWithStatistics } from '$lib/models/routechoice.model.js';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model.js';

	export let sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[];
	export let legRoutechoices: RoutechoiceWithStatistics[];

	let fasestTimeGraphData: GraphItem[] = [];
	let runnerNumberGraphData: GraphItem[] = [];

	// Lazily computing statistics for now
	// TODO: store statistics properly in database so it can be used in a dashboard

	function getRoutechoiceRunners(routechoiceId: string, sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[]) {
		return sortedRunnersWithOneLeg.filter(r => {
			const leg = r.legs[0];
			if (leg === undefined || leg === null) return false;
			if (leg?.fkManualRoutechoice === routechoiceId) return true;
			return leg.fkDetectedRoutechoice === routechoiceId
		})
	}

	$: {
		fasestTimeGraphData = legRoutechoices
			.map((rc) => {
				const routechoiceRunners = getRoutechoiceRunners(rc.id, sortedRunnersWithOneLeg)

				if (routechoiceRunners.length === 0 || routechoiceRunners[0].legs[0] === null || routechoiceRunners[0].legs[0].time === null) {
					return {
						label: rc.name,
						value: null,
						color: rc.color
					}
				}

				let bestTime = routechoiceRunners[0].legs[0]!.time

				for (const r of routechoiceRunners) {
					if (r !== null && r.legs.length !== 0 && r.legs[0] !== null && r.legs[0].time !== null && r.legs[0].time < bestTime) {
						bestTime = r.legs[0].time;
					}
				}

				return {
					label: rc.name,
					value: bestTime,
					color: rc.color
				}
			});

		runnerNumberGraphData = legRoutechoices
			.map((rc) => {
				const routechoiceRunners = getRoutechoiceRunners(rc.id, sortedRunnersWithOneLeg)

				return {
					label: rc.name,
					value: routechoiceRunners.length,
					color: rc.color
				}
			})
	}
</script>

<h3>Fastest time</h3>

<Graph data={fasestTimeGraphData} suffix={' s'} />

<h3>Runners per routechoice</h3>

<Graph data={runnerNumberGraphData} />
