<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { loginFormSchema } from './schema.js';
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import PasswordField from '$lib/components/form-fields/PasswordField.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: loginFormSchema,
		taintedMessage: null
	});

	const { delayed, enhance, errors } = form;
</script>

<form method="POST" use:enhance novalidate>
	<h1>Login</h1>

	<TextField {form} field="name" label="Name" />

	<PasswordField {form} field="password" label="Password" />

	<button type="submit" aria-busy={$delayed}>Login</button>

	<p><a href="/reset-password">Reset password</a></p>

	{#each $errors._errors ?? [] as globalError}
		<p>
			<small class="error">{globalError}</small>
		</p>
	{/each}
</form>
