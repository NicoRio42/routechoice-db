<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { UnwrapEffects } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import { formFieldProxy } from 'sveltekit-superforms/client';
	import type { z, AnyZodObject } from 'zod';

	type T = $$Generic<AnyZodObject>;

	export let form: SuperForm<UnwrapEffects<T>, unknown>;
	export let field: keyof z.infer<T>;
	export let label: string | undefined = undefined;
	export let loading = false;

	let errorsHaveBeenshownOnce = false;

	const { value, errors } = formFieldProxy(form, field);

	const unsub = errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	onDestroy(unsub);
</script>

<label aria-busy={loading}>
	{#if label !== undefined}
		{label}
	{/if}

	<select
		name={String(field)}
		bind:value={$value}
		data-invalid={$errors}
		aria-invalid={errorsHaveBeenshownOnce ? $errors !== undefined && $errors.length !== 0 : null}
		on:change
		{...$$restProps}
	>
		<slot />
	</select>

	{#each $errors ?? [] as error}
		<small class="error">{error}</small>
	{/each}
</label>
