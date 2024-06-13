<script lang="ts">
	import EmailField from '$lib/components/form-fields/EmailField.svelte';
	import PasswordField from '$lib/components/form-fields/PasswordField.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginFormSchema } from './schema';
	import GlobalFormErrors from '$lib/components/form-fields/GlobalFormErrors.svelte';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';

	export let data;
	let showCloudflareWorkerCpuErrorMessage = false;

	const form = superForm(data.form, {
		validators: zodClient(loginFormSchema),
		onError: ({ result }) => {
			if (result.status === 503) {
				showCloudflareWorkerCpuErrorMessage = true;
			}
		}
	});

	const { delayed, enhance, errors } = form;
</script>

<main class="max-w-90 m-x-auto my-4">
	<form method="POST" use:enhance novalidate>
		<h1 class="mb-4 mt0 sm:mt-4">Login</h1>

		<p>Routechoice DB is only available for the French Orienteering Team.</p>

		<EmailField {form} field="email" label="Email" />

		<PasswordField {form} field="password" label="Password" />

		<SubmitButton aria-busy={$delayed}>
			<i class="i-carbon-login block w-5 h-5"></i> Login
		</SubmitButton>

		<p><a href="/reset-password">Reset password</a></p>

		<GlobalFormErrors {form} />

		{#if showCloudflareWorkerCpuErrorMessage}
			<p>
				<small class="error"> Server error, please try login later. </small>
			</p>
		{/if}
	</form>
</main>
