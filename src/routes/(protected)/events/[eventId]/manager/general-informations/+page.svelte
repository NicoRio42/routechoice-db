<script lang="ts">
	import TagsSelect from "$lib/components/form-fields/TagsSelect.svelte";
	import TextField from "$lib/components/form-fields/TextField.svelte";
	import { superForm } from "sveltekit-superforms/client";
	import { generalInformationsSchema } from "./schema.js";

	export let data;

	const form = superForm(data.form, {
		validators: generalInformationsSchema,
		taintedMessage: null
	});

	const { delayed, enhance, errors } = form;
</script>

<form method="POST" use:enhance novalidate>
	<h1>General informations</h1>

	<TextField {form} field="name" label="Name" />

	<TagsSelect allTags={data.tags} {form} field="tags" label="Tags" />

	<button type="submit" aria-busy={$delayed}>Add new event</button>

	{#each $errors._errors ?? [] as globalError}
		<p>
			<small class="error">{globalError}</small>
		</p>
	{/each}
</form>