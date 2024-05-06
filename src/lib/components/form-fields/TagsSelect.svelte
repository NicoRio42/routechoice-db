<script lang="ts" context="module">
	import type { AnyZodObject } from 'zod';
	type T = AnyZodObject;
</script>

<script lang="ts" generics="T extends AnyZodObject">
	import { onDestroy } from 'svelte';
	import { addAlpha } from '$lib/helpers.js';
	import type { Tag } from '$lib/server/db/schema.js';
	import type { ZodValidation, FormPathLeaves } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import { formFieldProxy } from 'sveltekit-superforms/client';
	import type { z } from 'zod';

	export let allTags: Tag[];
	export let form: SuperForm<ZodValidation<T>, unknown>;
	export let field: FormPathLeaves<z.infer<T>>;
	export let label: string | undefined = undefined;

	let errorsHaveBeenshownOnce = false;

	const { value, errors } = formFieldProxy(form, field);

	const unsub = errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	let selectedTags: Tag[];
	$: selectedTags = allTags.filter((t) => $value.includes(t.id));

	onDestroy(unsub);
</script>

<label class="mb-8 !w-full">
	{#if label !== undefined}
		{label}
	{/if}

	<details role="list" class="dropdown w-full">
		<summary aria-haspopup="listbox" class="overflow-hidden nowrap">
			{#each selectedTags as tag}
				<span style:background-color={tag.color} class="mr-1 px-1 rounded text-white">
					{tag.name}
				</span>
			{/each}
		</summary>

		<ul role="listbox">
			<li>
				<button type="button" on:click={() => ($value = [])} class="outline">Clear</button>
			</li>

			{#each allTags as tag (tag.id)}
				<li>
					<label>
						<input
							type="checkbox"
							value={tag.id}
							name={field}
							bind:group={$value}
							style:--border-color={tag.color}
							style:--primary={tag.color}
							style:--form-element-focus-color={addAlpha(tag.color, 0.13)}
						/>

						<span style:background-color={tag.color} class="px-1 rounded text-white">
							{tag.name}
						</span>
					</label>
				</li>
			{/each}
		</ul>
	</details>

	{#each $errors ?? [] as error}
		<small class="error">{error}</small>
	{/each}
</label>
