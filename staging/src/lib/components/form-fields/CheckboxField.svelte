<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { UnwrapEffects } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import { formFieldProxy } from 'sveltekit-superforms/client';
	import type { z, AnyZodObject } from 'zod';

	type T = $$Generic<AnyZodObject>;

	export let form: SuperForm<UnwrapEffects<T>, unknown>;
	export let field: keyof z.infer<T>;
	export let label: string | undefined = undefined;

	let errorsHaveBeenshownOnce = false;

	const { value, errors } = formFieldProxy(form, field);

	errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	$: boolValue = value as Writable<boolean>;
</script>

<label>
	{#if label !== undefined}
		{label}
	{/if}

	<input
		name={String(field)}
		type="checkbox"
		bind:checked={$boolValue}
		data-invalid={$errors}
		aria-invalid={errorsHaveBeenshownOnce ? $errors !== undefined && $errors.length !== 0 : null}
		{...$$restProps}
	/>

	{#each $errors ?? [] as error}
		<small class="error">{error}</small>
	{/each}
</label>
