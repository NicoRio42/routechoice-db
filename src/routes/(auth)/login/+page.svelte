<script lang="ts">
	import EmailField from '$lib/components/form-fields/EmailField.svelte';
	import PasswordField from '$lib/components/form-fields/PasswordField.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { loginFormSchema } from './schema';

	export let data;
	let showCloudflareWorkerCpuErrorMessage = false

	const form = superForm(data.form, {
		validators: loginFormSchema,
		taintedMessage: null,
		onError: ({ result, message }) => {
			if ( result.status === 503) {
				showCloudflareWorkerCpuErrorMessage = true
			}
		}
	});

	const { delayed, enhance, errors } = form;
</script>

<form method="POST" use:enhance novalidate>
	<h1>Login</h1>

	<EmailField {form} field="email" label="Email" />

	<PasswordField {form} field="password" label="Password" />

	<button type="submit" aria-busy={$delayed}>Login</button>

	<p><a href="/reset-password">Reset password</a></p>

	{#each $errors._errors ?? [] as globalError}
		<p>
			<small class="error">{globalError}</small>
		</p>
	{/each}
	
	{#if showCloudflareWorkerCpuErrorMessage}
		<p>
			<small class="error">
				Server error, please try login later.
			</small>
		</p>
	{/if}
</form>
