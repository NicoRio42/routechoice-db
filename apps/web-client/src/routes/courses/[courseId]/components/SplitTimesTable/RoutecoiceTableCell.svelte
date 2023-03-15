<script context="module" lang="ts">
	export interface RoutechoiceChangeEventDetails {
		routechoiceID: string;
		runnerId: string;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type Routechoice from '$lib/o-utils/models/routechoice';
	import type Runner from '$lib/o-utils/models/runner';
	import userStore, { isUserAdminStore } from '$lib/stores/user.store';

	export let routechoices: Routechoice[] = [];
	export let runner: Runner;

	const dispatch = createEventDispatcher<{
		routechoiceChange: RoutechoiceChangeEventDetails;
	}>();

	$: selectedRoutechoice =
		runner.legs[0]?.manualRouteChoice?.id ?? runner.legs[0]?.detectedRouteChoice?.id ?? null;

	$: selectedRoutechoiceColor = routechoices.find((r) => r.id === selectedRoutechoice)?.color;

	async function handleChange(
		event: Event & {
			currentTarget: EventTarget & HTMLSelectElement;
		}
	) {
		if (!confirm('Are you sure to manually change this runner routechoice?')) {
			event.currentTarget.value =
				selectedRoutechoice === null ? '' : selectedRoutechoice.toString();

			return;
		}

		selectedRoutechoice = event.currentTarget.value ?? null;

		dispatch('routechoiceChange', {
			routechoiceID: selectedRoutechoice,
			runnerId: runner.id
		});
	}
</script>

<td class="right">
	{#if runner.legs !== null && runner.legs[0] !== null}
		{#if $isUserAdminStore || runner.userId === $userStore?.uid}
			<select
				style:color={selectedRoutechoiceColor}
				value={selectedRoutechoice}
				on:change={handleChange}
			>
				<option value={null} />

				{#each routechoices as routechoice}
					<option style:color={routechoice.color} value={routechoice.id}>{routechoice.name}</option>
				{/each}
			</select>
		{:else if runner.legs[0].manualRouteChoice !== null}
			<strong style:color={runner.legs[0]?.manualRouteChoice.color}
				>{runner.legs[0].manualRouteChoice.name}</strong
			>
		{:else if runner.legs[0].detectedRouteChoice !== null}
			<strong style:color={runner.legs[0]?.detectedRouteChoice.color}
				>{runner.legs[0].detectedRouteChoice.name}</strong
			>
		{/if}
	{/if}
</td>

<style>
	select {
		margin: 0;
		width: 2rem;
		padding: 0.125rem 0.25rem;
		background-position: center right 0;
	}

	.right {
		text-align: end;
	}
</style>
