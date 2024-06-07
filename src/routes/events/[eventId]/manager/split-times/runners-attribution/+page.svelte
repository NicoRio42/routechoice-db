<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { pushNotification } from '$lib/components/Notifications.svelte';
	import { getRunnersWithTracksAndSortedLegs } from '$lib/helpers.js';
	import { detectRunnersRoutechoices } from '$lib/routechoice-detector.js';
	import type { RunnerLeg } from '$lib/server/db/models.js';

	export let data;

	let duplicatedTrackingDeviceIdErrorRunnerId: string | null = null;
	let duplicatedUserIdErrorRunnerId: string | null = null;

	$: if (browser && duplicatedTrackingDeviceIdErrorRunnerId !== null)
		document.getElementById(duplicatedTrackingDeviceIdErrorRunnerId)?.scrollIntoView();

	$: if (browser && duplicatedUserIdErrorRunnerId !== null)
		document.getElementById(duplicatedUserIdErrorRunnerId)?.scrollIntoView();

	async function handleSubmit() {
		duplicatedTrackingDeviceIdErrorRunnerId = null;
		duplicatedUserIdErrorRunnerId = null;

		for (const { id, trackingDeviceId, fkUser } of data.runners) {
			if (
				trackingDeviceId !== null &&
				data.runners.some((r) => r.trackingDeviceId === trackingDeviceId && r.id !== id)
			) {
				duplicatedTrackingDeviceIdErrorRunnerId = id;
				return;
			}

			if (fkUser !== null && data.runners.some((r) => r.fkUser === fkUser && r.id !== id)) {
				duplicatedUserIdErrorRunnerId = id;
				return;
			}
		}

		const runnersWithTracksAndSortedLegs = await getRunnersWithTracksAndSortedLegs(
			data.legs,
			[data.liveEvent],
			data.runners,
			{ fetch, proxyRequests: true }
		);

		const runnersWithDetectedRoutechoices = detectRunnersRoutechoices(
			data.legs,
			runnersWithTracksAndSortedLegs
		);

		const runnersForPost = runnersWithDetectedRoutechoices.map((runner) => ({
			id: runner.id,
			fkLiveEvent: runner.fkLiveEvent,
			trackingDeviceId: runner.trackingDeviceId,
			fkUser: runner.fkUser,
			legs: runner.legs
				.filter((rl): rl is RunnerLeg => rl !== null)
				.map((runnerLeg) => ({
					id: runnerLeg.id,
					fkDetectedRoutechoice: runnerLeg.fkDetectedRoutechoice
				}))
		}));

		const response = await fetch($page.url.pathname, {
			method: 'POST',
			body: JSON.stringify(runnersForPost)
		});

		if (!response.ok) {
			pushNotification(
				'An error occured while saving runners attributions and detected routechoices.',
				{ type: 'error' }
			);

			return;
		}

		goto(`/events/${data.event.id}`);
	}
</script>

<h1 class="mt-8 mx-auto mb-4">Runners / GPS tracks / User correspondence</h1>

<p class="container">
	&#62;
	<a href={`/events/${data.event.id}/manager`}>{data.event.name}</a>

	&#62;
	<a href={`/events/${data.event.id}/manager/split-times`}>Split times</a>
</p>

<form method="post" on:submit|preventDefault={handleSubmit} class="container overflow-x-auto">
	<table>
		<thead>
			<tr>
				<th>Split times</th>
				<th>GPS track</th>
				<th>User</th>
			</tr>
		</thead>

		<tbody>
			{#each data.runners as runner (runner.id)}
				{@const isTrackingDeviceIdError = duplicatedTrackingDeviceIdErrorRunnerId === runner.id}
				{@const isUserError = duplicatedUserIdErrorRunnerId === runner.id}

				<tr id={runner.id}>
					<td>{`${runner.firstName} ${runner.lastName}`}</td>

					<td>
						<select
							bind:value={runner.trackingDeviceId}
							class="m-0"
							aria-invalid={isTrackingDeviceIdError ? true : null}
						>
							<option />

							{#each data.competitors as { deviceId, name } (deviceId)}
								<option value={deviceId}>
									{name}
								</option>
							{/each}
						</select>

						{#if isTrackingDeviceIdError}
							<small class="error mt-0"> GPS track allready assigned. </small>
						{/if}
					</td>

					<td>
						<select bind:value={runner.fkUser} class="m-0" aria-invalid={isUserError ? true : null}>
							<option />

							{#each data.users as { id, name } (id)}
								<option value={id}>{name}</option>
							{/each}
						</select>

						{#if isUserError}
							<small class="error mt-0"> User allready assigned. </small>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="flex justify-end mb-8 px-8">
		<button type="submit" class="submit">Save split times</button>
	</div>
</form>
