<script lang="ts">
	import { goto } from '$app/navigation';
	import CredentialsManagementLayout from '$lib/components/CredentialsManagementLayout.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import userStore from '$lib/stores/user.store';
	import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
	import { onMount } from 'svelte';

	const auth = getAuth();
	let redirectUrl: string | null = null;

	onMount(() => {
		const searchParams = new URLSearchParams(location.search);
		redirectUrl = searchParams.get('redirectUrl');
	});

	let email = '';
	let password = '';
	let loading = false;
	let showErrorMessage = false;

	const handleSubmit = () => {
		loading = true;
		showErrorMessage = false;

		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				$userStore = userCredential.user;
				goto(redirectUrl === null ? '/' : redirectUrl);
			})
			.catch((error) => {
				console.error(`${error.code} ${error.message}`);
				showErrorMessage = true;
			})
			.finally(() => (loading = false));
	};
</script>

<CredentialsManagementLayout pageTitle="Routechoice DB | Login" title="Login">
	<form on:submit|preventDefault={handleSubmit}>
		<label for="email"
			>Email

			<input bind:value={email} id="email" type="email" name="email" required />
		</label>

		<label for="password"
			>Password

			<PasswordInput bind:value={password} id="password" name="password" />
		</label>

		<a class="reset-password-link" href="/reset-password">Reset password</a>

		<button aria-busy={loading} disabled={loading} type="submit" on:click={handleSubmit}
			>Login</button
		>

		{#if showErrorMessage}
			<p class="error-message">Wrong email or password</p>
		{/if}
	</form>
</CredentialsManagementLayout>

<style>
	.error-message {
		color: red;
		font-size: smaller;
	}

	.reset-password-link {
		display: block;
		margin-bottom: 1rem;
	}
</style>
