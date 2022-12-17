<script lang="ts">
  import ArrowDown from "../../../shared/icons/ArrowDown.svelte";
  import { fade } from "svelte/transition";
  import { SortDirectionEnum } from "./sort-direction.enum";
  import { createEventDispatcher } from "svelte";

  export let sortDirection: null | SortDirectionEnum = null;

  const dispatch = createEventDispatcher<{
    sortChange: null | SortDirectionEnum;
  }>();

  function handleClick() {
    if (sortDirection === null) sortDirection = SortDirectionEnum.DESC;
    else if (sortDirection === SortDirectionEnum.DESC)
      sortDirection = SortDirectionEnum.ASC;
    else if (sortDirection === SortDirectionEnum.ASC) sortDirection = null;

    dispatch("sortChange", sortDirection);
  }
</script>

<th>
  <button on:click={handleClick}>
    <slot />

    {#if sortDirection !== null}
      <div
        transition:fade={{ duration: 125 }}
        class="arrow-wrapper"
        style:transform={sortDirection === SortDirectionEnum.ASC
          ? "rotate(180deg)"
          : "rotate(0)"}
      >
        <ArrowDown />
      </div>
    {/if}
  </button>
</th>

<style>
  button {
    background-color: transparent;
    border: none;
    box-shadow: none;
    margin: 0;
    padding: 0;
    color: hsl(205deg, 20%, 32%);
    display: flex;
    gap: 0.5rem;
  }

  .arrow-wrapper {
    width: 0.75rem;
    transition: transform 0.25s;
  }
</style>
