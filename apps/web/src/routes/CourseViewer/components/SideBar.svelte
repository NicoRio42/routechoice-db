<script lang="ts">
  import type CourseData from "../../../../shared/o-utils/models/course-data";
  import LegStatistics from "./LegStatistics/LegStatistics.svelte";
  import LegSplitTimesTable from "./SplitTimesTable/LegSplitTimesTable.svelte";
  import Toggle from "./Toggle.svelte";

  export let selectedRunners: string[];
  export let courseData: CourseData;
  export let legNumber: number;
  export let showSideBar: boolean;

  let isInSplitMode = true;
</script>

<aside class:toggle-sidebar={showSideBar}>
  <div class="main-wrapper">
    <Toggle
      bind:isFirstValueSelected={isInSplitMode}
      firstLabel={"Splits"}
      secondLabel={"Graph"}
    />

    {#if !isInSplitMode}
      <section class="routechoices-graph">
        <LegStatistics {courseData} {legNumber} />
      </section>
    {/if}

    <section
      style:display={isInSplitMode ? "block" : "none"}
      class="leg-split-times-table-container"
    >
      <LegSplitTimesTable
        {courseData}
        {legNumber}
        bind:selectedRunners
        on:routechoiceChange
      />
    </section>
  </div>
</aside>

<style>
  aside {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: white;
    width: 21rem;
    resize: horizontal;
    overflow-x: auto;
    border-right: 1px solid lightgray;
    z-index: 1;
  }

  .main-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem 0 1rem;
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
