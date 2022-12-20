<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Tag } from "../../../shared/models/tag";
  import { onDropDownClose } from "./dropdown-close.action";

  export let tags: Tag[] = [];

  let previousTags: Tag[] = [];
  const dispatch = createEventDispatcher<{ tagsSelect: Tag[] }>();

  const colors = [
    "rgba(158, 1, 66, 1)",
    "rgba(213, 62, 79, 1)",
    "rgba(244, 109, 67, 1)",
    "rgba(253, 174, 97, 1)",
    "rgba(254, 224, 139, 1)",
    "rgba(230, 245, 152, 1)",
    "rgba(171, 221, 164, 1)",
    "rgba(102, 194, 165, 1)",
    "rgba(50, 136, 189, 1)",
    "rgba(94, 79, 162, 1)",
  ];

  const availableTags: Tag[] = [
    {
      id: "32d749a7-62c5-4a17-87e2-f979e3e53916",
      name: "PFCO",
      color: "rgba(158, 1, 66, 1)",
    },
    {
      id: "b523f3e4-c9d5-424f-be69-bb6013b7028f",
      name: "PFJ",
      color: "rgba(213, 62, 79, 1)",
    },
    {
      id: "9144b5a2-88f6-4cd4-b96c-b442dcc84bd1",
      name: "GF -18",
      color: "rgba(244, 109, 67, 1)",
    },
    {
      id: "4f8b6d6b-20c8-4049-854b-e27f10ce1e5e",
      name: "GF Se",
      color: "rgba(253, 174, 97, 1)",
    },
  ];

  function handleDropDownClose() {
    if (
      tags.every((tag) => previousTags.some((t) => t.id === tag.id)) &&
      previousTags.every((tag) => tags.some((t) => t.id === tag.id))
    ) {
      return;
    }

    previousTags = tags;
    dispatch("tagsSelect", tags);
  }
</script>

<details role="list" use:onDropDownClose={handleDropDownClose}>
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
