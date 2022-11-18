<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  const dispatch = createEventDispatcher();
</script>

<form on:submit|preventDefault={() => dispatch("submit")} transition:fade>
  <label for=""
    >Date

    <input type="date" />
  </label>

  <label for=""
    >Course

    <select name="" id="" />
  </label>

  <label for=""
    >Class

    <select name="" id="" />
  </label>

  <footer class="footer">
    <button type="button" class="outline" on:click={() => dispatch("previous")}
      >Cancel</button
    >

    <button type="submit">Load splits</button>
  </footer>
</form>

<style>
  .footer {
    display: flex;
    gap: 1rem;
  }
</style>
