<script lang="ts" context="module">
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { onDestroy } from 'svelte';
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		dateProxy
	} from 'sveltekit-superforms';

	export let form: SuperForm<T>;
	export let field: FormPathLeaves<T>;
	export let label: string | undefined = undefined;
	export let loading = false;

	let errorsHaveBeenshownOnce = false;

	const { errors } = formFieldProxy(form, field);
	const proxyDate = dateProxy(form, field, { format: 'datetime-local' });

	const unsub = errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	onDestroy(unsub);
</script>

<label aria-busy={loading} class="!whitespace-normal">
	{#if label !== undefined}
		{label}
	{/if}

	<input
		name={String(field)}
		type="datetime-local"
		bind:value={$proxyDate}
		data-invalid={$errors}
		aria-invalid={errorsHaveBeenshownOnce ? $errors !== undefined && $errors.length !== 0 : null}
		{...$$restProps}
	/>

	{#each $errors ?? [] as error}
		<small class="error">{error}</small>
	{/each}
</label>
