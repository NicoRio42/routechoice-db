<script lang="ts">
	import { browser } from '$app/environment';
	import Trash from '$lib/components/icons/Trash.svelte';
	import type User from '$lib/models/user';
	import { isNotErrorResponse } from '$lib/utils/functions';
	import { getFunctions, httpsCallable } from 'firebase/functions';

	let users: User[] = [];
	const functions = getFunctions(undefined, 'europe-west1');

	const getUserList = httpsCallable<string, User[] | { message: string; error: unknown }>(
		functions,
		'getUserList'
	);

	const deleteUser = httpsCallable(functions, 'deleteUser');

	if (browser) init();

	async function init() {
		const getUsersData = (await getUserList()).data;
		if (!isNotErrorResponse<User[]>(getUsersData)) throw new Error('Problem loading users');

		users = getUsersData;
	}

	async function deleteUserById(userId: string) {
		if (!confirm('Are you sure to delete this user?')) return;

		try {
			await deleteUser(userId);
			users = users.filter((user) => user.id !== userId);
		} catch (error) {
			alert('An error occured while deleting the user');
			console.error(error);
		}
	}
</script>

<svelte:head>
	<title>Routechoice DB | Users</title>
</svelte:head>

<main class="container">
	<h1>Users</h1>

	<a href="/users/add" role="button"> Create user </a>

	<figure>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Role</th>
					<th>Email</th>
					<th />
				</tr>
			</thead>

			<tbody>
				{#each users as user (user.id)}
					<tr>
						<td>
							{user.displayName}
						</td>

						<td>{user.isAdmin ? 'Admin' : 'User'}</td>

						<td>{user.email}</td>

						<td class="action-row">
							<button on:click={() => deleteUserById(user.id)} class="delete-button" type="button">
								<Trash />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</figure>
</main>

<style>
	main {
		margin-top: 2rem;
		margin-bottom: 2rem;
	}

	.delete-button {
		display: contents;
		background-color: transparent;
		color: var(--h1-color);
		margin: 0;
		padding: 0;
		cursor: pointer;
	}
</style>
