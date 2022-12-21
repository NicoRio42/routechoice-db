<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Tag } from "../../../shared/models/tag";
  import { TAGS } from "./tags";

  export let tags: Tag[] = [];

  let previousTags: Tag[] = [];
  const dispatch = createEventDispatcher<{ tagsSelect: Tag[] }>();

  const availableTags: Tag[] = TAGS;

  function handleToggle(
    event: Event & {
      currentTarget: EventTarget & HTMLElement;
    }
  ) {
    if (
      event.currentTarget.getAttribute("open") !== null ||
      (tags.every((tag) => previousTags.some((t) => t.id === tag.id)) &&
        previousTags.every((tag) => tags.some((t) => t.id === tag.id)))
    ) {
      return;
    }

    previousTags = tags;
    dispatch("tagsSelect", tags);
  }
</script>

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
  {#each tags as tag}
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

<style>
  /* summary,
  ul,
  summary + ul li {
    width: fit-content;
  } */

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
