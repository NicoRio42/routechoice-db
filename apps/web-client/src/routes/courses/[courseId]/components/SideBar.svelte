<script lang="ts">
	import type { CourseData } from 'orienteering-js/models';
	import type { Routechoice } from 'orienteering-js/models';
	import type { Runner } from 'orienteering-js/models';
	import LegStatistics from './LegStatistics/LegStatistics.svelte';
	import LegSplitTimesTable from './SplitTimesTable/LegSplitTimesTable.svelte';
	import SummaryPanel from './SummaryPanel.svelte';
	import Toggle from './Toggle.svelte';

	export let selectedRunners: string[];
	export let courseData: CourseData;
	export let legNumber: number;
	export let showSideBar: boolean;

	let isInSplitMode = true;
	let sortedRunnersWithOneLeg: Runner[] = [];
	let legRoutechoices: Routechoice[] = [];

	$: {
		const clonedRunnersWithOneLeg = (structuredClone(courseData.runners) as Runner[]).map(
			(runner) => ({
				...runner,
				legs: runner.legs.filter((l, i) => i + 1 === legNumber)
			})
		);

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

		legRoutechoices = courseData.legs[legNumber - 1].routechoices;
	}
</script>

<SummaryPanel {legRoutechoices} {sortedRunnersWithOneLeg} />

<aside class:toggle-sidebar={showSideBar}>
	<div class="main-wrapper">
		<Toggle bind:isFirstValueSelected={isInSplitMode} firstLabel={'Splits'} secondLabel={'Graph'} />

		{#if !isInSplitMode}
			<section class="routechoices-graph">
				<LegStatistics {courseData} {legNumber} />
			</section>
		{/if}

		<section
			style:display={isInSplitMode ? 'block' : 'none'}
			class="leg-split-times-table-container"
		>
			<LegSplitTimesTable
				{sortedRunnersWithOneLeg}
				{legRoutechoices}
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
		background-color: white;
		width: 23rem;
		resize: horizontal;
		overflow-x: auto;
		border-right: 1px solid lightgray;
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

	@media screen and (max-width: 500px) {
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
