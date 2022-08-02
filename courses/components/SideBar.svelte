<script>
  import LegSplitTimesTable from "./SplitTimesTable/LegSplitTimesTable.svelte";
  import Statistics from "./Statistics.svelte";
  import Toggle from "./Toggle.svelte";
  import toggleSideBar from "../stores/toggle-sidebar";

  let isInSplitMode = true;
  let width = 400;
  let isMouseDown = false;

  function handleMousemove(event) {
    if (isMouseDown) {
      width = event.clientX < 320 ? 320 : event.clientX;
    }
  }
</script>

<svelte:window
  on:mousemove={handleMousemove}
  on:mouseup={() => (isMouseDown = false)}
/>

<aside
  class:toggle-sidebar={$toggleSideBar}
  style:width
  on:mousedown={() => (isMouseDown = true)}
>
  <div class="main-wrapper">
    <Toggle
      bind:isFirstValueSelected={isInSplitMode}
      firstLabel={"Splits"}
      secondLabel={"Graph"}
    />

    {#if !isInSplitMode}
      <section class="routechoices-graph">
        <Statistics />
      </section>
    {/if}

    {#if isInSplitMode}
      <section class="leg-split-times-table-container">
        <LegSplitTimesTable />
      </section>
    {/if}
  </div>

  <div class="resize-side" />
</aside>

<style>
  aside {
    display: none;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: white;
  }

  .main-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 4.375rem 1rem 1rem;
  }

  .resize-side {
    width: 0.125rem;
    border-right: 1px solid lightgray;
    cursor: e-resize;
  }

  .toggle-sidebar {
    display: flex;
  }

  .leg-split-times-table-container {
    flex: 1 1 auto;
    overflow-y: auto;
    margin: 0;
  }

  .routechoices-graph {
    overflow-y: auto;
    margin-bottom: 0;
  }

  @media screen and (max-width: 500px) {
    aside {
      width: 100% !important;
      right: 0;
      padding-bottom: 5rem;
      display: flex;
      flex-direction: column;
    }

    .toggle-sidebar {
      display: none;
    }

    .resize-side {
      display: none;
    }
  }
</style>
