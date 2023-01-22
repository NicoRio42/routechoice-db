<script lang="ts">
  import ChevronLeft from "../../../../shared/icons/ChevronLeft.svelte";
  import ChevronRight from "../../../../shared/icons/ChevronRight.svelte";
  import Eye from "../../../../shared/icons/Eye.svelte";
  import Elipsis from "../../../../shared/icons/Elipsis.svelte";
  import type Leg from "../../../../shared/o-utils/models/control";

  export let legNumber: number;
  export let legs: Leg[];
  export let showRoutechoices;
  export let showSideBar;

  const numberOfLegs = legs.length;

  const handlePreviousControl = () => {
    legNumber = legNumber !== 1 ? legNumber - 1 : legNumber;
  };

  const handleNextControl = () => {
    legNumber = legNumber !== numberOfLegs ? legNumber + 1 : legNumber;
  };
</script>

<div class="control-bar">
  <!-- <button
    class="map-buttons-toggler mobile"
    on:click={() => (showMapButtons = !showMapButtons)}
    
    ><Elipsis />
  </button>

  <button
    class="map-button mobile"
    on:click={displayAutoAnalysis}
    style:transform={showMapButtons ? "translateY(-230%)" : "translateY(0)"}
    >AA</button
  >

  <button
    class="map-button mobile"
    on:click={toggleRoutechoices}
    style:transform={showMapButtons ? "translateY(-115%)" : "translateY(0)"}
    ><Eye /></button
  > -->

  <!-- <button
    class="large"
    on:click={displayAutoAnalysis}
    >AA</button
  > -->

  <!-- <button
    class="large"
    on:click={toggleRoutechoices}
    ><Eye /></button
  > -->

  <button on:click={handlePreviousControl}><ChevronLeft /></button>

  <select bind:value={legNumber}>
    {#each [...Array(numberOfLegs).keys()] as leg}
      <option value={leg + 1}>{leg + 1}</option>
    {/each}
  </select>

  <button on:click={handleNextControl}><ChevronRight /></button>

  <!-- <button on:click={() => ($toggleSideBar = !$toggleSideBar)}><Chart /></button> -->
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
