<script lang="ts">
	import EmailField from '$lib/components/form-fields/EmailField.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { resetPasswordEmailSchema } from './schema';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(resetPasswordEmailSchema)
	});

	const { delayed, enhance, message } = form;
</script>

<main class="max-w-150 m-x-auto my-4">
	<form method="post" use:enhance>
		<h1>Reset password</h1>

		<EmailField {form} field="email" label="Email" />

		<SubmitButton aria-busy={$delayed}>
			<i class="i-carbon-send block w-5 h-5"></i> Send email
		</SubmitButton>

		{#if $message}
			<p>{$message}</p>
		{/if}
	</form>
</main>
