<script lang="ts">
	export let data;

	let loading = false;

	function handleSubmit() {}
</script>

<form on:submit|preventDefault={handleSubmit} class="step">
	<table>
		<thead>
			<tr>
				<th>Split times</th>
				<th>GPS track</th>
				<th>User</th>
			</tr>
		</thead>

		<tbody>
			{#each data.courseData.runners as runner}
				<tr>
					<td>{`${runner.firstName} ${runner.lastName}`}</td>

					<td>
						<select bind:value={runner.trackingDeviceId}>
							<option value={null} />

							{#each routes as route}
								{@const key = `loggator-${route.unit.replace('Log', '')}`}

								<option value={key}>{route.runnername}</option>
							{/each}
						</select>
					</td>

					<td>
						<select bind:value={runner.userId}>
							<option value={null} />

							{#each users as user}
								<option value={user.key}>{user.name}</option>
							{/each}
						</select>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<footer class="footer">
		<button type="button" class="outline">Cancel</button>
		<button aria-busy={loading} disabled={loading} type="submit">Save split times</button>
	</footer>
</form>

<style>
	.footer {
		display: flex;
		gap: 1rem;
	}
</style>
