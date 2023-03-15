<script lang="ts">
	import CredentialsManagementLayout from '$lib/components/CredentialsManagementLayout.svelte';
	import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

	const auth = getAuth();

	let email = '';
	let showErrorMessage = false;
	let showSuccessMessage = false;
	let loading = false;

	async function handleSubmit() {
		showErrorMessage = false;
		showSuccessMessage = false;
		const trimedEmail = email.trim();
		if (trimedEmail === '') return;

		loading = true;

		try {
			await sendPasswordResetEmail(auth, trimedEmail);
			showSuccessMessage = true;
		} catch (error) {
			console.error(error);
			showErrorMessage = true;
		} finally {
			loading = false;
		}
	}
</script>

<CredentialsManagementLayout pageTitle="Routechoice DB | Reset password" title="Reset password">
	<form on:submit|preventDefault={handleSubmit}>
		<label for="email"
			>Email

			<input bind:value={email} id="email" type="email" name="email" required />
		</label>

		<button aria-busy={loading} disabled={loading} type="submit" on:click={handleSubmit}
			>Reset password</button
		>

		{#if showErrorMessage}
			<p class="error-message">An error occured while sending the reset password email.</p>
		{/if}

		{#if showSuccessMessage}
			<p class="success-message">
				A email has been sent to the provided address. Please follow the link in the email to reset
				your password. If you can't find the email in your inbox, please check your spam folder.
			</p>
		{/if}
	</form>
</CredentialsManagementLayout>

<style>
	.error-message {
		color: red;
		font-size: smaller;
	}

	.success-message {
		color: green;
		font-size: smaller;
	}
</style>
