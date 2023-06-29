<script context="module" lang="ts">
	export interface RoutechoiceChangeEventDetails {
		routechoiceID: string;
		runnerId: string;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { User } from 'lucia-auth';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { Runner } from '../../models/runner.model.js';
	import type { Routechoice } from '$lib/server/db/schema.js';

	export let routechoices: Routechoice[] = [];
	export let runner: Runner;

	const dispatch = createEventDispatcher<{
		routechoiceChange: RoutechoiceChangeEventDetails;
	}>();

	// $: selectedRoutechoice =
	// 	runner.legs[0]?.manualRouteChoice?.id ?? runner.legs[0]?.detectedRouteChoice?.id ?? null;

	// $: selectedRoutechoiceColor = routechoices.find((r) => r.id === selectedRoutechoice)?.color;

	const user = getContext<Writable<User | null>>('user');

	// async function handleChange(
	// 	event: Event & {
	// 		currentTarget: EventTarget & HTMLSelectElement;
	// 	}
	// ) {
	// 	if (!confirm('Are you sure to manually change this runner routechoice?')) {
	// 		event.currentTarget.value =
	// 			selectedRoutechoice === null ? '' : selectedRoutechoice.toString();

	// 		return;
	// 	}

	// 	selectedRoutechoice = event.currentTarget.value ?? null;

	// 	dispatch('routechoiceChange', {
	// 		routechoiceID: selectedRoutechoice,
	// 		runnerId: runner.id
	// 	});
	// }
</script>

<td class="right">
	{#if runner.legs !== null && runner.legs[0] !== null}
		<!-- {#if $user !== null && ($user.role === RolesEnum.Enum.admin || runner.fkUser === $user.id)}
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
		{/if} -->

		{#if runner.legs[0].manualRouteChoice !== null}
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
