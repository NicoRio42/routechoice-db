<script lang="ts">
	import type { Tag } from '$lib/models/tag.js';
	import { createEventDispatcher } from 'svelte';
	import { TAGS } from './tags.js';

	export let initialTags: Tag[] = [];
	let tags: Tag[] = TAGS.filter((tag) => initialTags.some((t) => t.id === tag.id));

	let previousTags: Tag[] = [];
	const dispatch = createEventDispatcher<{ tagsSelect: Tag[] }>();

	const availableTags: Tag[] = TAGS;

	function handleToggle(
		event: Event & {
			currentTarget: EventTarget & HTMLElement;
		}
	) {
		if (
			event.currentTarget.getAttribute('open') !== null ||
			(tags.every((tag) => previousTags.some((t) => t.id === tag.id)) &&
				previousTags.every((tag) => tags.some((t) => t.id === tag.id)))
		) {
			return;
		}

		previousTags = tags;
		dispatch('tagsSelect', tags);
	}
</script>

<div class="wrapper">
	<details role="list" on:toggle={handleToggle}>
		<summary aria-haspopup="listbox">Tags</summary>

		<ul role="listbox">
			{#each availableTags as tag}
				<li>
					<input type="checkbox" value={tag} bind:group={tags} />{tag.name}
				</li>
			{/each}
		</ul>
	</details>

	<section>
		{#each tags as tag (tag.id)}
			<span style:background-color={tag.color}
				>{tag.name}

				<!-- <button
        type="button"
        on:click={() =>
          (selectedTags = selectedTags.filter((t) => t.id !== tag.id))}
      >
        <Xmark />
      </button> -->
			</span>
		{/each}
	</section>
</div>

<style>
	/* summary,
  ul,
  summary + ul li {
    width: fit-content;
  } */
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		align-items: baseline;
	}

	@media screen and (max-width: 750px) {
		.wrapper {
			grid-template-columns: 1fr;
		}
	}

	section {
		display: flex;
		gap: 1rem;
	}

	span {
		display: flex;
		gap: 0.5rem;
		color: white;
		padding: 0 0.5rem;
		white-space: nowrap;
		border-radius: 0.25rem;
		align-items: center;
	}

	/* button {
    display: flex;
    margin: 0;
    padding: 0;
    color: white;
    border: none;
    box-shadow: none;
    background-color: transparent;
    width: 0.5rem;
  } */
</style>
