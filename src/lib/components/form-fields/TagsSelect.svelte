<script lang="ts" context="module">
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { addAlpha } from '$lib/helpers.js';
	import type { Tag } from '$lib/server/db/models.js';
	import { onDestroy } from 'svelte';
	import { arrayProxy, type FormPathArrays, type SuperForm } from 'sveltekit-superforms';

	export let form: SuperForm<T>;
	export let field: FormPathArrays<T>;
	export let label: string | undefined = undefined;
	export let allTags: Tag[];

	let errorsHaveBeenshownOnce = false;

	const { values, errors } = arrayProxy(form, field);

	const unsub = errors.subscribe((errs) => {
		if (!errorsHaveBeenshownOnce) errorsHaveBeenshownOnce = errs !== undefined && errs.length !== 0;
	});

	let selectedTags: Tag[];
	$: selectedTags = allTags.filter((t) => $values.includes(t.id));

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
				<button
					type="button"
					on:click={() => {
						// @ts-ignore
						$values = [];
					}}
					class="outline">Clear</button
				>
			</li>

			{#each allTags as tag (tag.id)}
				<li>
					<label>
						<input
							type="checkbox"
							value={tag.id}
							name={field}
							bind:group={$values}
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
