<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
</script>

<h1>Runners / GPS tracks / User correspondence</h1>

<p>
	&#62;
	<a href={`/courses/${data.event.id}/manager`}>{data.event.name}</a>

	&#62;
	<a href={`/courses/${data.event.id}/manager/split-times`}>Split times</a>
</p>

<form method="post" use:enhance class="container">
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
				<tr>
					<td>{`${runner.firstName} ${runner.lastName}`}</td>

					<td>
						<select value={runner.trackingDeviceId} name="{runner.id}-tracking">
							<option />

							{#each data.competitors as competitor (competitor.deviceId)}
								<option value={`${data.liveEvent.id}|${competitor.deviceId}`}>
									{competitor.name}
								</option>
							{/each}
						</select>
					</td>

					<td>
						<select value={runner.userId} name="{runner.id}-user">
							<option />

							{#each data.users as user (user.id)}
								<option value={user.id}>{user.name}</option>
							{/each}
						</select>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<button type="submit" class="submit">Save split times</button>
</form>

<style>
	h1 {
		margin: 2rem auto 1rem;
	}

	.submit {
		width: fit-content;
		padding-left: 2rem;
		padding-right: 2rem;
		margin: auto;
	}
</style>
