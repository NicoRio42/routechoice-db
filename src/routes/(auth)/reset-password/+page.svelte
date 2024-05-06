<script lang="ts">
	import EmailField from '$lib/components/form-fields/EmailField.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { resetPasswordEmailSchema } from './schema.js';

	export let data;

	const form = superForm(data.form, {
		validators: resetPasswordEmailSchema,
		taintedMessage: null
	});

	const { delayed, enhance, message } = form;
</script>

<form method="post" use:enhance>
	<h1>Reset password</h1>

	<EmailField {form} field="email" label="Email" />

	<div class="flex justify-end">
		<button type="submit" aria-busy={$delayed}>Send email</button>
	</div>

	{#if $message}
		<p>{$message}</p>
	{/if}
</form>
