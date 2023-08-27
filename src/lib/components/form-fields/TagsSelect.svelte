<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { addAlpha } from '$lib/helpers.js';
	import type { Tag } from '$lib/server/db/schema.js';
	import type { UnwrapEffects } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import { formFieldProxy } from 'sveltekit-superforms/client';
	import type { AnyZodObject, z } from 'zod';

	type T = $$Generic<AnyZodObject>;

	export let allTags: Tag[];
	export let form: SuperForm<UnwrapEffects<T>, unknown>;
	export let field: keyof z.infer<T>;
	export let label: string | undefined = undefined;

	let errorsHaveBeenshownOnce = false;
	let dispatchToggle = createEventDispatcher<{ toggle: string }>();

	const { value, errors } = formFieldProxy(form, field);

	const unsub = errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	let inputElement: HTMLInputElement;
	let tags: Tag[] = allTags.filter((t) => $value.includes(t.id));

	$: {
		if (inputElement) {
			inputElement.value = tags.map((t) => t.id).join(',');
		}
	}

	function handleToggle(e: Event & { currentTarget: EventTarget & HTMLDetailsElement }) {
		if (e.currentTarget.open) return;

		dispatchToggle('toggle', inputElement.value);
	}

	onDestroy(unsub);
</script>

<label class="mb-8">
	{#if label !== undefined}
		{label}
	{/if}

	<input type="hidden" name={String(field)} bind:this={inputElement} bind:value={$value} />

	<details role="list" on:toggle={handleToggle}>
		<summary aria-haspopup="listbox" class="overflow-hidden nowrap">
			{#each tags as tag}
				<span style:background-color={tag.color} class="mr-1 px-1 rounded text-white">
					{tag.name}
				</span>
			{/each}
		</summary>

		<ul role="listbox">
			<li>
				<button type="button" on:click={() => (tags = [])} class="outline">Clear</button>
			</li>

			{#each allTags as tag}
				<li>
					<label>
						<input
							type="checkbox"
							value={tag}
							bind:group={tags}
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
