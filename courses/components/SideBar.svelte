<script>
  import LegSplitTimesTable from "./SplitTimesTable/LegSplitTimesTable.svelte";
  import Statistics from "./Statistics.svelte";
  import Toggle from "./Toggle.svelte";
  import toggleSideBar from "../stores/toggle-sidebar";

  let isInSplitMode = true;
</script>

<aside class:toggle-sidebar={$toggleSideBar}>
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
</aside>

<style>
  aside {
    display: none;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 20rem;
    padding: 4.375rem 1rem 1rem;
    border-right: 1px solid lightgray;
    background-color: white;
  }

  .toggle-sidebar {
    display: flex;
    flex-direction: column;
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
      width: 100%;
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
