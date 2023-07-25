<script lang="ts">
	import { enhance } from '$app/forms';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { EventWithLiveEventsRunnersLegsAndControlPoints } from '$lib/models/event.model.js';
	import type { RunnerWithNullableLegs as Runner } from '$lib/models/runner.model.js';
	import type { Routechoice } from '$lib/server/db/schema.js';
	import type { User } from 'lucia-auth';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let routechoices: Routechoice[] = [];
	export let runner: Runner;

	const user = getContext<Writable<User | null>>('user');
	const event = getContext<Writable<EventWithLiveEventsRunnersLegsAndControlPoints>>('event');

	async function handleChange(
		event: Event & {
			currentTarget: EventTarget & HTMLSelectElement;
		}
	) {
		if (!confirm('Are you sure to manually change this runner routechoice?')) {
			event.currentTarget.value =
				runner.legs[0]!.fkManualRoutechoice ?? runner.legs[0]!.fkDetectedRoutechoice ?? '';

			event.preventDefault();
			return;
		}

		event.currentTarget.form?.submit();
	}
</script>

<td class="text-right">
	{#if runner.legs !== null && runner.legs[0] !== null}
		{@const manualRouteChoice = routechoices.find(
			(rc) => runner.legs[0]?.fkManualRoutechoice === rc.id
		)}

		{@const detectedRouteChoice = routechoices.find(
			(rc) => runner.legs[0]?.fkDetectedRoutechoice === rc.id
		)}

		{@const selectedRoutechoice = manualRouteChoice ?? detectedRouteChoice ?? null}

		{#if $user !== null && ($user.role === RolesEnum.Enum.admin || runner.fkUser === $user.id)}
			<form
				method="post"
				action="/events/{$event.id}/runners/{runner.id}/legs/{runner.legs[0].id}?/updateRoutechoice"
				class="contents"
				use:enhance
			>
				<select
					class="routechoice-select"
					name="routechoiceId"
					style:color={selectedRoutechoice?.color}
					value={selectedRoutechoice?.id}
					on:change={handleChange}
				>
					<option value={null} />

					{#each routechoices as routechoice}
						<option style:color={routechoice.color} value={routechoice.id}>
							{routechoice.name}
						</option>
					{/each}
				</select>
			</form>
		{:else if manualRouteChoice !== undefined}
			<strong style:color={manualRouteChoice.color}>{manualRouteChoice.name}</strong>
		{:else if detectedRouteChoice !== undefined}
			<strong style:color={detectedRouteChoice.color}>{detectedRouteChoice.name}</strong>
		{/if}
	{/if}
</td>

<style>
	select.routechoice-select {
		margin: 0;
		max-width: 2rem;
		padding: 0.125rem 0 0.125rem 0.25rem;
		background-position: center right 0;
	}
</style>
