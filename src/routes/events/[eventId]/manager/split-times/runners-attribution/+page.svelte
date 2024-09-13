<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { pushNotification } from '$lib/components/Notifications.svelte';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';
	import { getRunnersWithTracksAndSortedLegs } from '$lib/helpers.js';
	import { detectRunnersRoutechoices } from '$lib/routechoice-detector.js';
	import type { RunnerLeg } from '$lib/server/db/models.js';

	export let data;

	let duplicatedTrackingDeviceIdErrorRunnerId: string | null = null;
	let duplicatedUserIdErrorRunnerId: string | null = null;
	let loading = false;
	let tooFast = false;

	$: if (loading) {
		tooFast = true;
		setTimeout(() => (tooFast = false), 250);
	}

	$: if (browser && duplicatedTrackingDeviceIdErrorRunnerId !== null)
		document.getElementById(duplicatedTrackingDeviceIdErrorRunnerId)?.scrollIntoView();

	$: if (browser && duplicatedUserIdErrorRunnerId !== null)
		document.getElementById(duplicatedUserIdErrorRunnerId)?.scrollIntoView();

	async function handleSubmit() {
		duplicatedTrackingDeviceIdErrorRunnerId = null;
		duplicatedUserIdErrorRunnerId = null;
		loading = true;

		for (const { id, trackingDeviceId, fkUser } of data.runners) {
			if (
				trackingDeviceId !== null &&
				data.runners.some((r) => r.trackingDeviceId === trackingDeviceId && r.id !== id)
			) {
				duplicatedTrackingDeviceIdErrorRunnerId = id;
				loading = false;
				return;
			}

			if (fkUser !== null && data.runners.some((r) => r.fkUser === fkUser && r.id !== id)) {
				duplicatedUserIdErrorRunnerId = id;
				loading = false;
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
			fkLiveEvent: data.liveEvent.id,
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

			loading = false;
			return;
		}

		loading = false;
		goto(`/events/${data.event.id}/map`);
	}
</script>

<main class="md:mx-auto px-4 md:w-180 my-6 pb-12">
	<h1 class="mx-4">Runners / GPS tracks / User matching</h1>

	<form method="post" on:submit|preventDefault={handleSubmit}>
		<figure class="overflow-auto">
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
								<select
									bind:value={runner.fkUser}
									class="m-0"
									aria-invalid={isUserError ? true : null}
								>
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
		</figure>

		<SubmitButton class="mx-4" aria-busy={loading && !tooFast}>
			<i class="i-carbon-save block w-5 h-5"></i> Save matching
		</SubmitButton>
	</form>
</main>
