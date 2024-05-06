<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	$: {
		if (browser && form?.error.runnerId !== undefined) {
			document.getElementById(form.error.runnerId)?.scrollIntoView();
		}
	}
</script>

<h1 class="mt-8 mx-auto mb-4">Runners / GPS tracks / User correspondence</h1>

<p class="container">
	&#62;
	<a href={`/events/${data.event.id}/manager`}>{data.event.name}</a>

	&#62;
	<a href={`/events/${data.event.id}/manager/split-times`}>Split times</a>
</p>

<form method="post" use:enhance class="container overflow-x-auto">
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
				{@const isTrackingDeviceIdError = form?.error.runnerId === runner.id && form.error.code === "SAME_TRACKING_DEVICE_ID"}
				{@const isUserError = form?.error.runnerId === runner.id && form.error.code === "SAME_USER_ID"}
				
				<tr id={runner.id}>
					<td>{`${runner.firstName} ${runner.lastName}`}</td>

					<td>
						<select
							value="{data.liveEvent.id}|{runner.trackingDeviceId}"
							name="{runner.id}-tracking"
							class="m-0"
							aria-invalid={isTrackingDeviceIdError ? true : null}
						>
							<option />
							
							{#each data.competitors as competitor (competitor.deviceId)}
								<option value="{data.liveEvent.id}|{competitor.deviceId}">
									{competitor.name}
								</option>
								{/each}
							</select>

							{#if isTrackingDeviceIdError}
								<small class="error mt-0">
									GPS track allready assigned.
								</small>
							{/if}
						</td>

					<td>
						<select
							value={runner.userId}
							name="{runner.id}-user"
							class="m-0"
							aria-invalid={isUserError ? true : null}
						>
							<option />

							{#each data.users as user (user.id)}
								<option value={user.id}>{user.name}</option>
							{/each}
						</select>

						{#if isUserError}
							<small class="error mt-0">
								User allready assigned.
							</small>
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

