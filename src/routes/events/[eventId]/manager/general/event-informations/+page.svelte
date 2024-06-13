<script lang="ts">
	import GlobalFormErrors from '$lib/components/form-fields/GlobalFormErrors.svelte';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { generalInformationsSchema } from './schema';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(generalInformationsSchema)
	});

	const { delayed, enhance, errors } = form;
</script>

<main class="sm:mx-auto px-4 sm:w-100 my-6 pb-12">
	<form method="POST" use:enhance novalidate>
		<h1>General informations</h1>

		<TextField {form} field="name" label="Name" />

		<TagsSelect allTags={data.tags} {form} field="tags" label="Tags" />

		<SubmitButton aria-busy={$delayed}>Submit</SubmitButton>

		<GlobalFormErrors {form} />
	</form>
</main>
