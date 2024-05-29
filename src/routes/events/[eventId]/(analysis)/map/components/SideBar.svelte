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
	<Toggle bind:isFirstValueSelected={isInSplitMode} firstLabel={'Splits'} secondLabel={'Graph'} />

	<div class="w-full overflow-x-hidden">
		<div class="main-wrapper" class:-translate-x-50%={!isInSplitMode}>
			<section class="graph-section">
				<LegSplitTimesTable
					{sortedRunnersWithOneLeg}
					{legRoutechoices}
					isLastSplit={legNumber === legs.length}
					bind:selectedRunners
					on:routechoiceChange
					on:changeRunnerTimeOffset
				/>
			</section>

			<section class="splits-section">
				<LegStatistics {legRoutechoices} {sortedRunnersWithOneLeg} />
			</section>
		</div>
	</div>
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		transform: translateX(-100%);
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		background-color: var(--pico-background-color);
		width: 23rem;
		resize: horizontal;
		overflow-x: auto;
		border-right: 1px solid var(--pico-table-border-color);
		z-index: 2;
		transition: transform 0.25s;
		padding-top: 0.5rem;
	}

	.main-wrapper {
		flex-grow: 1;
		overflow-x: hidden;
		width: 200%;
		height: 100%;
		display: flex;
		transition: transform 0.25s;
	}

	.splits-section,
	.graph-section {
		overflow-y: auto;
		width: 100%;
		flex-grow: 1;
		margin: 0;
	}

	.graph-section {
		padding: 0 0.5rem;
	}

	.toggle-sidebar {
		transform: translateX(0);
		transition: transform 0.25s;
	}

	@media screen and (max-width: 768px) {
		aside {
			width: 100% !important;
			right: 0;
			padding-bottom: 5rem;
			transform: translateX(0);
		}

		.toggle-sidebar {
			transform: translateX(-100%);
		}
	}
</style>
