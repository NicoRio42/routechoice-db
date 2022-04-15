<script>
  export let selectedLeg;
  export let numberOfLegs;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function dispatchChange() {
    dispatch("legChange");
  }

  const handlePreviousControl = () => {
    selectedLeg = selectedLeg !== 1 ? selectedLeg - 1 : selectedLeg;
    dispatchChange();
  };

  const handleNextControl = () => {
    selectedLeg = selectedLeg !== numberOfLegs ? selectedLeg + 1 : selectedLeg;
    dispatchChange();
  };
</script>

<div class="control-bar">
  <button on:click={handlePreviousControl}
    ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"
      ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
        d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"
      /></svg
    ></button
  >

  <select bind:value={selectedLeg} on:change={dispatchChange}>
    {#each [...Array(numberOfLegs).keys()] as leg}
      <option value={leg + 1}>{leg + 1}</option>
    {/each}
  </select>

  <button on:click={handleNextControl}
    ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"
      ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
        d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
      /></svg
    ></button
  >
</div>

<style>
  .control-bar {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  select {
    background-color: white;
    width: 5rem;
    border-radius: 0.5rem;
  }

  button {
    width: 100%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button svg {
    height: 1.25rem;
  }
</style>
