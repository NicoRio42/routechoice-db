<script lang="ts">
  import LegSplitTimesTable from "./SplitTimesTable/LegSplitTimesTable.svelte";
  import LegStatistics from "./LegStatistics/LegStatistics.svelte";
  import Toggle from "./Toggle.svelte";
  import toggleSideBar from "../stores/toggle-sidebar";

  let isInSplitMode = true;
</script>

<aside class:toggle-sidebar={$toggleSideBar}>
  <div class="main-wrapper">
    <Toggle
      bind:isFirstValueSelected={isInSplitMode}
      firstLabel={"Splits"}
      secondLabel={"Graph"}
    />

    {#if !isInSplitMode}
      <section class="routechoices-graph">
        <LegStatistics />
      </section>
    {/if}

    <section
      style:display={isInSplitMode ? "block" : "none"}
      class="leg-split-times-table-container"
    >
      <LegSplitTimesTable />
    </section>
  </div>
</aside>

<style>
  aside {
    display: none;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: white;
    width: 21rem;
    resize: horizontal;
    overflow-x: auto;
    border-right: 1px solid lightgray;
  }

  .main-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 4.375rem 0 1rem;
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
    padding-left: 0.5rem;
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
  }
</style>
