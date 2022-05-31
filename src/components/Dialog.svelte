<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { clickOutside } from "../utils/click-outside/clickOutside";

  const dispatch = createEventDispatcher();

  const closeDialog = () => {
    dispatch("closeDialog");
  };
</script>

<dialog open transition:fade={{ duration: 250 }}>
  <article class="modal-content" use:clickOutside on:clickOutside={closeDialog}>
    <a
      aria-label="Close"
      class="close"
      data-target="modal"
      on:click={closeDialog}
    />
    <slot name="title" />
    <slot name="content" class="slot" />
  </article>
</dialog>

<style>
  .modal-content {
    position: relative;
    padding-bottom: 1rem;
    width: 500px;
  }

  @media screen and (max-width: 500px) {
    .modal-content {
      width: inherit;
    }
  }
</style>
