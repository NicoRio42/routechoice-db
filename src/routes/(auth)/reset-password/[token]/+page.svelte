<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { resetPasswordSchema } from './schema';
	import PasswordField from '$lib/components/form-fields/PasswordField.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(resetPasswordSchema)
	});

	const { errors, delayed, enhance } = form;
</script>

<main class="max-w-180 m-x-auto my-4 pb-12">
	<form method="post" use:enhance>
		<h1>Reset password</h1>

		<PasswordField {form} field="password" label="Password" />

		<PasswordField {form} field="passwordConfirmation" label="Confirm password" />

		<button type="submit" aria-busy={$delayed}>Change password</button>

		{#each $errors._errors ?? [] as globalError}
			<p>
				<small class="error">{globalError}</small>
			</p>
		{/each}
	</form>
</main>
