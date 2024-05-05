<script lang="ts">
	import { page } from '$app/stores';
	import type { LegWithRoutechoices } from '$lib/models/leg.model.js';
	import type { RoutechoiceWithStatistics } from '$lib/models/routechoice.model.js';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model.js';
	import LegStatistics from './LegStatistics/LegStatistics.svelte';
	import LegSplitTimesTable from './SplitTimesTable/LegSplitTimesTable.svelte';
	import Toggle from './Toggle.svelte';

	export let selectedRunners: string[];
	export let runners: RunnerWithNullableLegsAndTrack[];
	export let legs: LegWithRoutechoices[];
	export let legNumber: number;

	let isInSplitMode = true;
	let sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[] = [];
	let legRoutechoices: RoutechoiceWithStatistics[] = [];

	$: hideSideBar = $page.url.searchParams.has('hideSideBar');

	$: {
		const clonedRunnersWithOneLeg = runners.map((runner) => ({
			...runner,
			legs: runner.legs.filter((l, i) => i + 1 === legNumber)
		}));

		sortedRunnersWithOneLeg = clonedRunnersWithOneLeg.sort((runner1, runner2) => {
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
		});

		legRoutechoices = legs[legNumber - 1]?.routechoices ?? [];
	}
</script>

<!-- <SummaryPanel {legRoutechoices} {sortedRunnersWithOneLeg} /> -->

<aside class:toggle-sidebar={!hideSideBar}>
	<div class="main-wrapper">
		<Toggle bind:isFirstValueSelected={isInSplitMode} firstLabel={'Splits'} secondLabel={'Graph'} />

		<section style:display={isInSplitMode ? 'none' : 'block'} class="routechoices-graph">
			<LegStatistics {legRoutechoices} {sortedRunnersWithOneLeg} />
		</section>

		<section
			style:display={isInSplitMode ? 'block' : 'none'}
			class="leg-split-times-table-container"
		>
			<LegSplitTimesTable
				{sortedRunnersWithOneLeg}
				{legRoutechoices}
				isLastSplit={legNumber === legs.length}
				bind:selectedRunners
				on:routechoiceChange
				on:changeRunnerTimeOffset
			/>
		</section>
	</div>
</aside>

<style>
	aside {
		display: none;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		background-color: var(--pico-background-color);
		width: 23rem;
		resize: horizontal;
		overflow-x: auto;
		border-right: 1px solid var(--pico-table-border-color);
		z-index: 1;
	}

	.main-wrapper {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem 0 1rem;
	}

	.toggle-sidebar {
		display: flex;
	}

	.leg-split-times-table-container {
		flex: 1 1 auto;
		overflow-y: auto;
		margin: 0;
	}

	.routechoices-graph {
		overflow-y: auto;
		padding-left: 0.5rem;
		margin-bottom: 0;
	}

	@media screen and (max-width: 768px) {
		aside {
			width: 100% !important;
			right: 0;
			padding-bottom: 5rem;
			display: flex;
			flex-direction: column;
		}

		.toggle-sidebar {
			display: none;
		}
	}
</style>
