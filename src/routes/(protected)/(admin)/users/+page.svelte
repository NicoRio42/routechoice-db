<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;

	function confirmDeletion(e: Event) {
		if (!confirm('Are you sure to delete this user?')) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	}
</script>

<main class="container mt-6 px-4">
	<h1>Users</h1>

	<a href="/users/add" role="button">Add user</a>

	<figure class="mt-6">
		<table>
			<thead>
				<tr>
					<th>First name</th>
					<th>Last name</th>
					<th>Email</th>
					<th>Role</th>
					<th>Email verified</th>
					<th>Password expired</th>
					<th />
					<th />
				</tr>
			</thead>

			<tbody>
				{#each data.users as user}
					<tr>
						<td>{user.firstName}</td>
						<td>{user.lastName}</td>
						<td>{user.email}</td>
						<td>{user.role}</td>
						<td>{user.emailVerified ? 'Yes' : 'No'}</td>
						<td>{user.passwordExpired ? 'Yes' : 'No'}</td>

						<td>
							<a href="/users/{user.id}/update" role="button" class="btn-unset">
								<i class="i-carbon-edit block translate-y-0.75" />
							</a>
						</td>

						<td>
							<!-- Warning: submit event handler should be before enhance action -->
							<form
								action="/users/{user.id}/delete"
								method="post"
								class="m-0 p-0"
								on:submit={confirmDeletion}
								use:enhance
							>
								<button type="submit" class="btn-unset">
									<i class="i-carbon-trash-can block" />
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</figure>
</main>
