<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { confirmSubmit } from '$lib/actions/confirm-submit.js';
	import Paginator from '$lib/components/Paginator.svelte';

	export let data;
</script>

<main class="container mt-6 px-4">
	<header class="max-w-150 mx-auto">
		<div class="flex items-center justify-between">
			<h1 class="my-0">Users</h1>
			
			<a href="/users/add" role="button" class="flex items-center gap-1 p2">
				<i class="i-carbon-add inline-block w6 h6"></i>

				New
			</a>
		</div>

		<form method="get" class="m-0 p-0 mt-4 max-w-100% flex items-center gap-4">
			<input
				type="search"
				name="search"
				placeholder="Search in first name, last name"
				value={$page.url.searchParams.get('search')}
				class="!mb0 !rounded-[var(--pico-border-radius)]"
			>

			<button type="submit" class="outline w-fit flex items-center gap-1 p2 ml-auto my4">
				<i class="i-carbon-filter inline-block w6 h6"></i>
				
				Filter
			</button>
		</form>
	</header>

	<figure class="mt-6">
		<table>
			<thead>
				<tr>
					<th>Last name</th>
					<th>First name</th>
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
						<td>{user.lastName}</td>
						<td>{user.firstName}</td>
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
								use:confirmSubmit={'Are you sure to delete this user?'}
								use:enhance
							>
								<button type="submit" class="btn-unset">
									<i class="i-carbon-trash-can block" />
								</button>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="8" class="text-center py-10"> No users for these filters. </td>
					</tr>
				{/each}
			</tbody>
		</table>
	</figure>
	
	<Paginator pageNumber={data.pageNumber} isLastPage={data.isLastPage}></Paginator>
</main>
