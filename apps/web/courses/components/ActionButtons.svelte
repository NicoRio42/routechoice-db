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
  import Elipsis from "../../shared/icons/Elipsis.svelte";

  let numberOfLegs = 0;
  let showMapButtons = false;

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

  const toggleRoutechoices = () => {
    selectHack("selectmode", "analyzecourse");

    const newValue =
      (document.getElementById("showtagsselect") as HTMLSelectElement | null)
        ?.value === "1"
        ? "0"
        : "1";

    selectHack("showtagsselect", newValue);
  };

  function displayAutoAnalysis() {
    selectHack("selectmode", "analyzecourse");
    const autoAnalysisButton = document.getElementById("autobutton");
    autoAnalysisButton?.click();
  }
</script>

<div class="control-bar">
  <button
    class="map-buttons-toggler mobile"
    on:click={() => (showMapButtons = !showMapButtons)}
    disabled={!$is2DRerunLoaded}
    ><Elipsis />
  </button>

  <button
    class="map-button mobile"
    on:click={displayAutoAnalysis}
    style:transform={showMapButtons ? "translateY(-230%)" : "translateY(0)"}
    disabled={!$is2DRerunLoaded}>AA</button
  >

  <button
    class="map-button mobile"
    on:click={toggleRoutechoices}
    style:transform={showMapButtons ? "translateY(-115%)" : "translateY(0)"}
    disabled={!$is2DRerunLoaded}><Eye /></button
  >

  <button
    class="large"
    on:click={displayAutoAnalysis}
    disabled={!$is2DRerunLoaded}>AA</button
  >

  <button
    class="large"
    on:click={toggleRoutechoices}
    disabled={!$is2DRerunLoaded}><Eye /></button
  >

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
    bottom: var(--form-element-spacing-vertical);
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
    margin-bottom: 0;
  }

  button {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0;
  }

  .map-buttons-toggler {
    z-index: 2;
  }

  .map-button {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    transform: translateY(0);
    transition: transform 0.25s;
  }

  .mobile {
    display: inherit;
  }

  .large {
    display: none;
  }

  @media screen and (min-width: 500px) {
    .control-bar {
      transform: translate(calc(-50% - 1.75rem));
    }

    .map-buttons-toggler {
      display: none;
    }

    .map-button {
      transform: translateX(calc(-1 * calc(100% + 0.5rem)));
    }

    .mobile {
      display: none;
    }

    .large {
      display: inherit;
    }
  }
</style>
