<script lang="ts">
	import Pen from '$lib/components/icons/Pen.svelte';
	import type CourseData from '$lib/o-utils/models/course-data';
	import type Routechoice from '$lib/o-utils/models/routechoice';
	import type Runner from '$lib/o-utils/models/runner';
	import { isUserAdminStore } from '$lib/stores/user.store';
	import { createEventDispatcher } from 'svelte';
	import RoutechoiceTableCell from './RoutecoiceTableCell.svelte';
	import { fullNameToShortName, rankToCSSClass, secondsToPrettyTime } from './utils';

	export let selectedRunners: string[];
	export let courseData: CourseData;
	export let legNumber: number;

	console.log(courseData.runners);

	const dispatch = createEventDispatcher<{ changeRunnerTimeOffset: string }>();

	let sortedRunnersWithOneLeg: Runner[] = [];
	let legRoutechoices: Routechoice[] = [];
	let iShowAllRunnersTracksChecked = false;

	$: {
		const clonedRunnerWithOneLeg = (structuredClone(courseData.runners) as Runner[]).map(
			(runner) => ({
				...runner,
				legs: runner.legs.filter((l, i) => i + 1 === legNumber)
			})
		);

		sortedRunnersWithOneLeg = clonedRunnerWithOneLeg.sort((runner1, runner2) => {
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

	function handleAllTrackedSelection(event: {
		currentTarget: EventTarget & HTMLInputElement;
	}): void {
		if (event.currentTarget.checked) {
			selectedRunners = courseData.runners.filter((r) => r.track !== null).map((r) => r.id);
			return;
		}

		selectedRunners = [];
	}

	function handleShowTrackCheckboxChange(
		event: Event & { currentTarget: EventTarget & HTMLInputElement },
		runnerId: string
	): void {
		if (event.currentTarget.checked) {
			if (!selectedRunners.includes(runnerId)) selectedRunners = [...selectedRunners, runnerId];
		} else {
			selectedRunners = selectedRunners.filter((id) => id !== runnerId);
		}

		iShowAllRunnersTracksChecked = courseData.runners
			.filter((r) => r.track !== null)
			.every((r) => selectedRunners.includes(r.id));
	}
</script>

<table>
	<thead>
		<tr>
			<th class="sticky-header">Runners</th>

			<th class="sticky-header">Time</th>

			<th class="sticky-header right">RC</th>

			<th class="sticky-header right"
				><input
					type="checkbox"
					bind:checked={iShowAllRunnersTracksChecked}
					on:input={handleAllTrackedSelection}
				/></th
			>
		</tr>
	</thead>

	{#each sortedRunnersWithOneLeg as runner (runner.id)}
		<tr>
			<td data-tooltip={`${runner.firstName} ${runner.lastName}`}>
				{fullNameToShortName(runner.firstName, runner.lastName)}
			</td>

			<td class:mistake={runner.legs[0]?.isMistake}>
				{#if runner.legs[0] !== null}
					<div
						class="tooltip-container {rankToCSSClass(runner.legs[0].rankSplit)}"
						data-tooltip={`+ ${secondsToPrettyTime(runner.legs[0].timeBehindSplit)}`}
					>
						{`${secondsToPrettyTime(runner.legs[0].time)} (${runner.legs[0].rankSplit})`}
					</div>

					<div
						class="tooltip-container {rankToCSSClass(runner.legs[0].rankOverall)}"
						data-tooltip={`+ ${secondsToPrettyTime(runner.legs[0].timeBehindOverall)}`}
					>
						{`${secondsToPrettyTime(runner.legs[0].timeOverall)} (${runner.legs[0].rankOverall})`}
					</div>
				{/if}
			</td>

			{#if legRoutechoices.length > 0}
				<RoutechoiceTableCell routechoices={legRoutechoices} {runner} on:routechoiceChange />
			{:else}
				<td />
			{/if}

			{#if runner.track !== null}
				<td>
					<input
						type="checkbox"
						value={runner.id}
						checked={selectedRunners.includes(runner.id)}
						on:change={(e) => handleShowTrackCheckboxChange(e, runner.id)}
					/>
				</td>
			{/if}

			{#if runner.track !== null && $isUserAdminStore && false}
				<td class="pen-td">
					<button
						on:click={() => dispatch('changeRunnerTimeOffset', runner.id)}
						type="button"
						class="pen-button"><Pen --width="1rem" --height="1rem" /></button
					>
				</td>
			{/if}
		</tr>
	{/each}
	<tbody />
</table>

<style>
	table {
		font-size: smaller;
	}

	table th.sticky-header {
		position: sticky;
		top: 0;
		z-index: 1;
		background-color: white;
	}

	.tooltip-container,
	.tooltip {
		white-space: nowrap;
	}

	.tooltip-container {
		position: relative;
	}

	[data-tooltip] {
		border-bottom: none;
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

	.right {
		text-align: end;
	}

	.pen-td {
		padding: 0;
	}

	.pen-button {
		margin: 0;
		padding: 0;
		color: var(--h1-color);
		background-color: transparent;
		border: none;
		box-shadow: none;
	}
</style>
