<script lang="ts" context="module">
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		fileProxy
	} from 'sveltekit-superforms';

	export let form: SuperForm<T>;
	export let field: FormPathLeaves<T>;
	export let label: string | undefined = undefined;

	let errorsHaveBeenshownOnce = false;

	const { errors } = formFieldProxy(form, field);
	const file = fileProxy(form, field);

	const unsub = errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	const dispatch = createEventDispatcher<{ filesChange: FileList | null }>();

	onDestroy(unsub);
</script>

<label>
	{#if label !== undefined}
		{label}
	{/if}

	<input
		name={String(field)}
		type="file"
		bind:files={$file}
		data-invalid={$errors}
		aria-invalid={errorsHaveBeenshownOnce ? $errors !== undefined && $errors.length !== 0 : null}
		{...$$restProps}
		on:change={(e) => dispatch('filesChange', e.currentTarget.files)}
	/>

	{#each $errors ?? [] as error}
		<small class="error">{error}</small>
	{/each}
</label>
