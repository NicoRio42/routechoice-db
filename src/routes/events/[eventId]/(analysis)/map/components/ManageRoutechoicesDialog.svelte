<script lang="ts">
	import { page } from '$app/stores';
	import { confirmSubmit } from '$lib/actions/confirm-submit.js';
	import { parseRoutechoicesTracksInASingleLeg } from '$lib/helpers';
	import type { LegWithRoutechoices } from '$lib/models/leg.model';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model';
	import { detectRunnersRoutechoicesForASingleLeg } from '$lib/routechoice-detector';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { DeleteRoutechoice } from '../deleteRoutechoice/delete-routechoice-schema';
	import { pushNotification } from '$lib/components/Notifications.svelte';

	export let leg: LegWithRoutechoices;
	export let show: boolean;
	export let runners: RunnerWithNullableLegsAndTrack[];
	export let legIndex: number;

	type RunnerLegToUpdate = { id: string; fkRunner: string; fkDetectedRoutechoice: string | null };

	const deleteRoutechoiceLoadingMap: Record<string, boolean> = {};
	const deleteRoutechoiceToofastMap: Record<string, boolean> = {};

	const dispatch = createEventDispatcher<{
		startDrawingNewRoutechoice: undefined;
		deleteRoutechoice: { deletedRoutechoiceId: string; runnerLegsToUpdate: RunnerLegToUpdate[] };
	}>();

	async function handleDeleteRoutechoice(routechoiceId: string) {
		deleteRoutechoiceLoadingMap[routechoiceId] = true;
		deleteRoutechoiceToofastMap[routechoiceId] = true;
		setTimeout(() => (deleteRoutechoiceToofastMap[routechoiceId] = false), 250);

		const legWithoutDeletedRoutechoice = {
			...leg,
			routechoices: leg.routechoices.filter((r) => r.id !== routechoiceId)
		};

		const runnersWithDetectedRoutechoices = detectRunnersRoutechoicesForASingleLeg(
			parseRoutechoicesTracksInASingleLeg(legWithoutDeletedRoutechoice),
			runners,
			legIndex
		);

		const runnerLegsToUpdate: RunnerLegToUpdate[] = [];

		for (const runner of runnersWithDetectedRoutechoices) {
			const runnerLeg = runner.legs[legIndex];
			if (runnerLeg === null) continue;

			runnerLegsToUpdate.push({
				id: runnerLeg.id,
				fkRunner: runner.id,
				fkDetectedRoutechoice: runnerLeg.fkDetectedRoutechoice
			});
		}

		const response = await fetch($page.url.pathname + '/deleteRoutechoice', {
			method: 'POST',
			body: JSON.stringify({
				routechoiceId,
				runnerLegsToUpdate
			} satisfies DeleteRoutechoice)
		});

		deleteRoutechoiceLoadingMap[routechoiceId] = false;

		if (!response.ok) {
			pushNotification('An error occured while deleting the routechoice', { type: 'error' });
			return;
		}

		dispatch('deleteRoutechoice', { deletedRoutechoiceId: routechoiceId, runnerLegsToUpdate });
		show = false;
	}
</script>

<dialog open transition:fade={{ duration: 125 }}>
	<article>
		<h2>Routechoices</h2>

		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Length</th>
					<th>Color</th>
					<th></th>
				</tr>
			</thead>

			<tbody>
				{#each leg.routechoices as routechoice (routechoice.id)}
					<tr>
						<td>{routechoice.name}</td>
						<td>{Math.round(routechoice.length)} m</td>
						<td style:background-color={routechoice.color}></td>

						<td>
							<form
								use:confirmSubmit={'Are you sure to delete this routechoice?'}
								on:submit|preventDefault={() => handleDeleteRoutechoice(routechoice.id)}
								class="m-0 p-0"
							>
								<button
									type="submit"
									class="btn-unset"
									aria-busy={deleteRoutechoiceLoadingMap[routechoice.id] &&
										!deleteRoutechoiceToofastMap[routechoice.id]}
								>
									<i class="i-carbon-trash-can w-5 h-5 block" />
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="flex justify-end gap-2">
			<button type="button" class="outline" on:click={() => (show = false)}>Cancel</button>

			<button
				type="button"
				class="flex items-center gap-2"
				on:click={() => {
					dispatch('startDrawingNewRoutechoice');
					show = false;
				}}
			>
				<i class="i-carbon-add w-6 h-6 block"></i>

				Add routechoice</button
			>
		</div>
	</article>
</dialog>
