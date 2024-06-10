<script lang="ts">
	import { page } from '$app/stores';
	import { addAlpha } from '$lib/helpers.js';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type {
		RunnerWithLegsAndTracks,
		RunnerWithNullableLegsAndTrack
	} from '$lib/models/runner.model.js';
	import type { Routechoice } from '$lib/server/db/models.js';
	import { fullNameToShortName } from '$lib/utils/split-times';
	import GreenJersey from '../../../components/GreenJersey.svelte';
	import Medal from '../../../components/Medal.svelte';
	import LegCell from './LegCell.svelte';
	import RoutechoiceTableCell from './RoutecoiceTableCell.svelte';

	export let selectedRunnersIds: string[];
	export let sortedRunnersWithOneLeg: RunnerWithNullableLegsAndTrack[];
	export let legRoutechoices: Routechoice[];
	export let isLastSplit = false;
	export let legNumber: number;
	export let selectedRunners: RunnerWithLegsAndTracks[];

	let iShowAllRunnersTracksChecked = false;

	function handleAllTrackedSelection(event: {
		currentTarget: EventTarget & HTMLInputElement;
	}): void {
		if (event.currentTarget.checked) {
			selectedRunnersIds = sortedRunnersWithOneLeg.filter((r) => r.track !== null).map((r) => r.id);
			return;
		}

		selectedRunnersIds = [];
	}

	function handleShowTrackCheckboxChange(
		event: Event & { currentTarget: EventTarget & HTMLInputElement },
		runnerId: string
	): void {
		if (event.currentTarget.checked) {
			if (!selectedRunnersIds.includes(runnerId))
				selectedRunnersIds = [...selectedRunnersIds, runnerId];
		} else {
			selectedRunnersIds = selectedRunnersIds.filter((id) => id !== runnerId);
		}

		iShowAllRunnersTracksChecked = sortedRunnersWithOneLeg
			.filter((r) => r.track !== null)
			.every((r) => selectedRunnersIds.includes(r.id));
	}
</script>

<table class="striped">
	<thead>
		<tr>
			<th class="sticky-header"></th>

			<th class="sticky-header">Runners</th>

			<th class="sticky-header text-end">Time</th>

			{#if legRoutechoices.length !== 0}
				<th class="sticky-header right">RC</th>
			{/if}

			<th class="sticky-header text-center"
				><input
					type="checkbox"
					bind:checked={iShowAllRunnersTracksChecked}
					on:input={handleAllTrackedSelection}
				/></th
			>
		</tr>
	</thead>

	<tbody>
		{#each sortedRunnersWithOneLeg as runner (runner.id)}
			{@const runnerLeg = runner.legs[0]}
			{@const selectedRunner = selectedRunners.find((r) => r.id === runner.id)}

			<tr>
				<td class="!p-0">
					{#if runnerLeg?.rankSplit}
						<div class="flex justify-center items-center">
							{#if runnerLeg.rankSplit > 3}
								{runnerLeg.rankSplit}
							{:else if isLastSplit && runnerLeg.rankSplit === 1}
								<GreenJersey />
							{:else}
								<Medal rank={runnerLeg.rankSplit} />
							{/if}
						</div>
					{/if}
				</td>

				<td data-tooltip={`${runner.firstName} ${runner.lastName}`}>
					{fullNameToShortName(runner.firstName, runner.lastName)}
				</td>

				<LegCell {runnerLeg} {isLastSplit}></LegCell>

				{#if legRoutechoices.length !== 0}
					<RoutechoiceTableCell routechoices={legRoutechoices} {runner} {legNumber} />
				{/if}

				<td class="text-center">
					{#if runner.track !== null}
						{@const trackColor = selectedRunner?.track?.color ?? runner.track.color}

						<input
							type="checkbox"
							value={runner.id}
							checked={selectedRunnersIds.includes(runner.id)}
							on:change={(e) => handleShowTrackCheckboxChange(e, runner.id)}
							style:--pico-border-color={trackColor}
							style:--pico-primary-background={trackColor}
							style:--pico-form-element-focus-color={addAlpha(trackColor, 0.13)}
						/>
					{/if}
				</td>
			</tr>
		{:else}
			<tr>
				<td
					colspan={legRoutechoices.length === 0 ? 4 : 5}
					class="text-8 text-center border-none !bg-background-color"
				>
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
	</tbody>
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
