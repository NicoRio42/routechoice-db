<script>
	import { superForm } from 'sveltekit-superforms/client';
	import { signUpFormSchema } from './schema';
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import PasswordField from '$lib/components/form-fields/PasswordField.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: signUpFormSchema,
		taintedMessage: null
	});

	const { delayed, enhance } = form;
</script>

<form method="POST" use:enhance novalidate>
	<h1>Create an account</h1>

	<TextField {form} field="name" label="Name" />

	<TextField {form} field="email" label="Email address" />

	<PasswordField {form} field="password" label="Password" />

	<PasswordField {form} field="passwordConfirmation" label="Confirm password" />

	<button type="submit" aria-busy={$delayed}>Sign up</button>
</form>
