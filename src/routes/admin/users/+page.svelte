<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
</script>

<main class="container">
	<h1>Users</h1>

	<table>
		<thead>
			<tr>
				<th>User</th>
				<th />
			</tr>
		</thead>

		<tbody>
			{#each data.users.filter((u) => u.id !== data.user.id) as user (user.id)}
				<tr>
					<td>{user.name}</td>

					<td>
						<form use:enhance action="/users/{user.id}?/delete" method="POST">
							<button>Delete</button>
						</form>
					</td>
				</tr>
			{:else}
				<tr class="default-row">
					<td colspan="2">No users</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>

<style>
	.container {
		max-width: 25rem;
	}
</style>
