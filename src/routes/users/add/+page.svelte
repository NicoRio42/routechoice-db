<script>
	import CheckboxField from '$lib/components/form-fields/CheckboxField.svelte';
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { userFormSchema } from '../userFormSchema';

	export let data;

	const form = superForm(data.form, {
		validators: userFormSchema,
		taintedMessage: null
	});

	const { delayed, enhance, errors } = form;
</script>

<form method="POST" use:enhance novalidate class="mt-4">
	<h1 class="mb-2">Add user</h1>

	<TextField {form} field="firstName" label="First name" />

	<TextField {form} field="lastName" label="Last name" />

	<TextField {form} field="email" label="Email address" />

	<CheckboxField {form} field="isAdmin" label="Admin" />

	<div class="flex justify-end">
		<button type="submit" aria-busy={$delayed}>Add</button>
	</div>

	{#each $errors._errors ?? [] as globalError}
		<p>
			<small class="error">{globalError}</small>
		</p>
	{/each}
</form>
