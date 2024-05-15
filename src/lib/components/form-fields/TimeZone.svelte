<script lang="ts" context="module">
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { timezones } from './timezones';
	import { onDestroy } from 'svelte';
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	export let form: SuperForm<T>;
	export let field: FormPathLeaves<T>;
	export let label: string | undefined = undefined;

	let errorsHaveBeenshownOnce = false;

	const { value, errors } = formFieldProxy(form, field);

	const unsub = errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	onDestroy(unsub);
</script>

<label>
	{#if label !== undefined}
		{label}
	{/if}

	<input
		name={String(field)}
		type="text"
		bind:value={$value}
		list="timezones"
		data-invalid={$errors}
		aria-invalid={errorsHaveBeenshownOnce ? $errors !== undefined && $errors.length !== 0 : null}
		{...$$restProps}
	/>

	{#each $errors ?? [] as error}
		<small class="error">{error}</small>
	{/each}
</label>

<datalist id="timezones">
	{#each timezones as timezone}
		<option value={timezone.offset} />
	{/each}
</datalist>
