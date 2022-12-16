<script lang="ts">
  export let isFirstValueSelected: boolean;
  export let firstLabel: string;
  export let secondLabel: string;
</script>

<div class="toggle-container">
  <button
    on:click={() => (isFirstValueSelected = true)}
    class="first-button"
    class:not-selected={!isFirstValueSelected}>{firstLabel}</button
  >
  <button
    on:click={() => (isFirstValueSelected = false)}
    class="second-button"
    class:not-selected={isFirstValueSelected}>{secondLabel}</button
  >
</div>

<style>
  .toggle-container {
    display: flex;
    padding-right: 1rem;
    padding-left: 1rem;
  }

  button {
    padding: 0.25rem;
  }

  .not-selected {
    background-color: transparent;
    color: rgb(16, 149, 193);
  }

  .first-button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .second-button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
</style>
