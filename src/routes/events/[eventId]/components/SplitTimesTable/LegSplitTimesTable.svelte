<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import RoutechoiceTableCell from './RoutecoiceTableCell.svelte';
	import { fullNameToShortName, rankToCSSClass, secondsToPrettyTime } from './utils.js';
	import type { Routechoice } from '$lib/server/db/schema.js';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model.js';
	import { addAlpha } from '$lib/helpers.js';
	import { page } from '$app/stores';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import LegCell from './LegCell.svelte';

	export let selectedRunners: string[];
	export let sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[];
	export let legRoutechoices: Routechoice[];
	export let isLastSplit = false;

	let iShowAllRunnersTracksChecked = false;

	const dispatch = createEventDispatcher<{ changeRunnerTimeOffset: string }>();

	function handleAllTrackedSelection(event: {
		currentTarget: EventTarget & HTMLInputElement;
	}): void {
		if (event.currentTarget.checked) {
			selectedRunners = sortedRunnersWithOneLeg.filter((r) => r.track !== null).map((r) => r.id);
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

		iShowAllRunnersTracksChecked = sortedRunnersWithOneLeg
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

			<th class="sticky-header text-center"
				><input
					type="checkbox"
					bind:checked={iShowAllRunnersTracksChecked}
					on:input={handleAllTrackedSelection}
				/></th
			>
		</tr>
	</thead>

	{#each sortedRunnersWithOneLeg as runner (runner.id)}
		{@const runnerLeg = runner.legs[0]}

		<tr>
			<td data-tooltip={`${runner.firstName} ${runner.lastName}`}>
				{fullNameToShortName(runner.firstName, runner.lastName)}
			</td>

			<LegCell {runnerLeg} {isLastSplit}></LegCell>

			{#if legRoutechoices.length > 0}
				<RoutechoiceTableCell routechoices={legRoutechoices} {runner} />
			{:else}
				<td />
			{/if}

			{#if runner.track !== null}
				<td class="text-center">
					<input
						type="checkbox"
						value={runner.id}
						checked={selectedRunners.includes(runner.id)}
						on:change={(e) => handleShowTrackCheckboxChange(e, runner.id)}
						style:--border-color={runner.track.color}
						style:--primary={runner.track.color}
						style:--form-element-focus-color={addAlpha(runner.track.color, 0.13)}
					/>
				</td>
			{/if}

			<!-- {#if runner.track !== null && $isUserAdminStore && false}
				<td class="pen-td">
					<button
						on:click={() => dispatch('changeRunnerTimeOffset', runner.id)}
						type="button"
						class="pen-button"><Pen --width="1rem" --height="1rem" /></button
					>
				</td>
			{/if} -->
		</tr>
	{:else}
		<tr>
			<td colspan="4" class="text-8 text-center border-none">				
				{#if $page.data.event.legs.length === 0}
					<p class="mt-8">
						No course yet.
					</p>
					
					{#if $page.data.user?.role === RolesEnum.Enum.admin}
						<a href="/events/{$page.data.event.id}/manager/course-and-routechoices" class="text-6">Add course and routechoices</a>
					{/if}
				{:else}
					<p class="mt-8">
						No split times yet.
					</p>
					
					{#if $page.data.user?.role === RolesEnum.Enum.admin}
						<a href="/events/{$page.data.event.id}/manager/split-times" class="text-6">Add split times</a>
					{/if}
				{/if}
			</td>
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
		background-color: var(--background-color);
	}

	.tooltip-container,
	.tooltip {
		white-space: nowrap;
	}

	.tooltip-container {
		position: relative;
	}

	[data-tooltip]:not(td) {
		border-bottom: none;
	}

	td[data-tooltip] {
		border-bottom: var(--border-width) solid var(--table-border-color);
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
