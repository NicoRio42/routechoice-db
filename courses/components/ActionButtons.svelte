<script>
  import Chart from "../../shared/icons/Chart.svelte";
  import ChevronLeft from "../../shared/icons/ChevronLeft.svelte";
  import ChevronRight from "../../shared/icons/ChevronRight.svelte";
  import Star from "../../shared/icons/Star.svelte";
  import showSideBar from "../stores/show-sidebar";
  import selectedLeg from "../stores/selected-leg";

  export let numberOfLegs = 10;

  const handlePreviousControl = () => {
    if (numberOfLegs === 0) {
      return;
    }

    $selectedLeg = $selectedLeg !== 1 ? $selectedLeg - 1 : $selectedLeg;
  };

  const handleNextControl = () => {
    if (numberOfLegs === 0) {
      return;
    }

    $selectedLeg =
      $selectedLeg !== numberOfLegs ? $selectedLeg + 1 : $selectedLeg;
  };
</script>

<div class="control-bar">
  <button class="mobile" disabled><Star /></button>

  <button on:click={handlePreviousControl}><ChevronLeft /></button>

  <select bind:value={$selectedLeg}>
    {#each [...Array(numberOfLegs).keys()] as leg}
      <option value={leg + 1}>{leg + 1}</option>
    {/each}
  </select>

  <button on:click={handleNextControl}><ChevronRight /></button>

  <button class="mobile" on:click={() => showSideBar.update((show) => !show)}
    ><Chart /></button
  >
</div>

<style>
  .control-bar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
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
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media screen and (min-width: 500px) {
    .mobile {
      display: none;
    }
  }
</style>
