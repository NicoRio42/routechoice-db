<script lang="ts">
	import { goto } from '$app/navigation';
	import { getFunctions, httpsCallable } from 'firebase/functions';

	let loading = false;
	let name = '';
	let email = '';
	let password = '';
	let isAdmin = false;

	const functions = getFunctions(undefined, 'europe-west1');
	const createUserWithRole = httpsCallable(functions, 'createUserWithRole');

	async function handleSubmit() {
		if (
			isAdmin &&
			!confirm(
				'Admin user will be able to modify everything in the app. Are you sure you want to create an admin user ?'
			)
		)
			return;

		const [trimedName, trimedEmail] = [name.trim(), email.trim()];

		if (password.includes(' ')) {
			alert('Password should not include spaces.');
			return;
		}

		if (password.length < 6) {
			alert('Password should be at least 6 characters long.');
			return;
		}

		if (trimedName === '' || trimedEmail === '' || password === '') {
			alert('You have to fill all the fields.');
			return;
		}

		loading = true;

		try {
			await createUserWithRole({
				displayName: trimedName,
				email: trimedEmail,
				password,
				isAdmin
			});

			goto('users');
		} catch (error) {
			alert('Something went wrong durring user creation.');
			console.error(error);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Routechoice DB | Create user</title>
</svelte:head>

<form on:submit|preventDefault={handleSubmit}>
	<h1>Create user</h1>

	<label for="name"
		>User name
		<input bind:value={name} type="text" id="name" />
	</label>

	<label for="name"
		>Email
		<input bind:value={email} type="email" id="name" />
	</label>

	<label for="name"
		>Password
		<input bind:value={password} type="text" id="name" />
	</label>

	<label for="name"
		>Admin role
		<input bind:checked={isAdmin} type="checkbox" id="name" />
	</label>

	<button aria-busy={loading} type="submit" class="submit-btn">Create</button>
</form>

<style>
	form {
		max-width: 25rem;
		margin: 1rem auto;
	}

	.submit-btn {
		margin-top: 1.5rem;
	}
</style>
