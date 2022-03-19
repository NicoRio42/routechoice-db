<script>
  import { fly } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { clickOutside } from "../utils/click-outside/clickOutside";

  const dispatch = createEventDispatcher();

  const closeDialog = () => {
    dispatch("closeDialog");
  };
</script>

<div transition:fly class="modal">
  <div use:clickOutside on:clickOutside={closeDialog} class="modal-content">
    <header>
      <slot name="title" />
      <span on:click={closeDialog} class="close">&times;</span>
    </header>
    <slot name="content" class="slot" />
  </div>
</div>

<style>
  .modal {
    position: fixed;
    z-index: 2;
    padding-top: 100px;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    height: 80%;
    overflow-y: auto;
  }

  header {
    display: flex;
    justify-content: space-between;
  }

  .close {
    color: #aaaaaa;
    font-size: 28px;
    font-weight: bold;
    text-align: right;
    margin-bottom: 1rem;
  }

  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }
</style>
