<script lang="ts">
	import { page } from '$app/stores';
	import { addAlpha } from '$lib/helpers.js';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model.js';
	import type { Routechoice } from '$lib/server/db/schema.js';
	import LegCell from './LegCell.svelte';
	import RoutechoiceTableCell from './RoutecoiceTableCell.svelte';
	import { fullNameToShortName } from './utils.js';

	export let selectedRunners: string[];
	export let sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[];
	export let legRoutechoices: Routechoice[];
	export let isLastSplit = false;

	let iShowAllRunnersTracksChecked = false;

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

			<th class="sticky-header text-end">Time</th>

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
						style:--pico-border-color={runner.track.color}
						style:--pico-primary-background={runner.track.color}
						style:--pico-form-element-focus-color={addAlpha(runner.track.color, 0.13)}
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
					<p class="mt-8">No course yet.</p>

					{#if $page.data.user?.role === RolesEnum.Enum.admin}
						<a href="/events/{$page.data.event.id}/manager/course-and-routechoices" class="text-6"
							>Add course and routechoices</a
						>
					{/if}
				{:else}
					<p class="mt-8">No split times yet.</p>

					{#if $page.data.user?.role === RolesEnum.Enum.admin}
						<a href="/events/{$page.data.event.id}/manager/split-times" class="text-6"
							>Add split times</a
						>
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
		background-color: var(--pico-background-color);
	}

	[data-tooltip]:not(td) {
		border-bottom: none;
	}

	td[data-tooltip] {
		border-bottom: var(--pico-border-width) solid var(--pico-table-border-color);
	}
</style>
