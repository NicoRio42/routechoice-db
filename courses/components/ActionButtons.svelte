<script lang="ts">
  import Chart from "../../shared/icons/Chart.svelte";
  import ChevronLeft from "../../shared/icons/ChevronLeft.svelte";
  import ChevronRight from "../../shared/icons/ChevronRight.svelte";
  import selectedLeg from "../stores/selected-leg";
  import courseData from "../stores/course-data";
  import toggleSideBar from "../stores/toggle-sidebar";
  import is2DRerunLoaded from "../stores/rerun-2d-loaded";
  import { selectHack } from "../utils/2d-rerun-hacks/select-hack";
  import Eye from "../../shared/icons/Eye.svelte";

  let numberOfLegs = 0;
  let rightmenu: HTMLDivElement | null = null;

  $: {
    numberOfLegs = $courseData.legs.length;
  }

  const handlePreviousControl = () => {
    if ($selectedLeg === null) return;
    $selectedLeg = $selectedLeg !== 1 ? $selectedLeg - 1 : $selectedLeg;
  };

  const handleNextControl = () => {
    if ($selectedLeg === null) return;

    $selectedLeg =
      $selectedLeg !== numberOfLegs ? $selectedLeg + 1 : $selectedLeg;
  };

  const togle2dRerunPanel = () => {
    if (!rightmenu) {
      rightmenu = document.getElementById("rightmenu") as HTMLDivElement;
    }

    rightmenu.style.display =
      rightmenu.style.display === "block" ? "none" : "block";
  };

  const toggleRoutechoices = () => {
    selectHack("selectmode", "analyzecourse");

    const newValue =
      (document.getElementById("showtagsselect") as HTMLSelectElement | null)
        ?.value === "1"
        ? "0"
        : "1";

    selectHack("showtagsselect", newValue);
  };
</script>

<div class="control-bar">
  <!-- <button on:click={togle2dRerunPanel}>2D</button> -->
  <button on:click={toggleRoutechoices}><Eye /></button>

  <button
    on:click={handlePreviousControl}
    disabled={numberOfLegs === 0 || !$is2DRerunLoaded}><ChevronLeft /></button
  >

  <select
    bind:value={$selectedLeg}
    disabled={numberOfLegs === 0 || !$is2DRerunLoaded}
  >
    {#each [...Array(numberOfLegs).keys()] as leg}
      <option value={leg + 1}>{leg + 1}</option>
    {/each}
  </select>

  <button
    on:click={handleNextControl}
    disabled={numberOfLegs === 0 || !$is2DRerunLoaded}><ChevronRight /></button
  >

  <button on:click={() => ($toggleSideBar = !$toggleSideBar)}><Chart /></button>
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
</style>
