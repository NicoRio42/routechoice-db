<script lang="ts">
  import type CourseData from "../../../shared/o-utils/models/course-data";
  import { changeRunnerRoutechoice } from "../../db/routechoice";
  import ActionButtons from "./components/ActionButtons.svelte";
  import AutoAnalysis from "./components/AutoAnalysis.svelte";
  import GeoreferencedImage from "./components/GeoreferencedImage/GeoreferencedImage.svelte";
  import OlMap from "./components/OLMap.svelte";
  import OSM from "./components/OSM.svelte";
  import RoutechoiceTrack from "./components/RoutechoiceTrack.svelte";
  import RunnerRoute from "./components/RunnerRoute.svelte";
  import SideBar from "./components/SideBar.svelte";
  import type { RoutechoiceChangeEventDetails } from "./components/SplitTimesTable/RoutecoiceTableCell.svelte";
  import VectorLayer from "./components/VectorLayer.svelte";
  import "./styles.css";
  import { computeFitBoxAndAngleFromLegNumber } from "./utils";

  export let courseData: CourseData;

  let angle: number;
  let fitBox: [number, number, number, number];
  let legNumber = 1;
  let selectedRunners: string[] = [];
  let showRoutechoices = true;
  let showSideBar = true;
  let isAutoAnalysisMode = false;

  $: {
    const [newFitBox, newAngle] = computeFitBoxAndAngleFromLegNumber(
      legNumber,
      courseData
    );

    fitBox = newFitBox;
    angle = newAngle;
  }

  function handleRoutechoiceChange(
    event: CustomEvent<RoutechoiceChangeEventDetails>
  ): void {
    courseData = changeRunnerRoutechoice(
      courseData,
      event.detail.routechoiceID,
      event.detail.runnerId,
      legNumber
    );
  }
</script>

<div class="wrapper">
  <SideBar
    bind:selectedRunners
    {courseData}
    {legNumber}
    {showSideBar}
    on:routechoiceChange={handleRoutechoiceChange}
  />

  <OlMap {angle} {fitBox} padding={[100, 0, 100, 0]}>
    <OSM />

    {#if courseData.map !== null}
      <GeoreferencedImage
        url={courseData.map.url}
        mapCalibration={courseData.map.calibration}
      />
    {/if}

    <VectorLayer>
      {#if showRoutechoices}
        {@const routechoices = courseData.legs[legNumber - 1].routechoices}

        {#each routechoices as routechoice (routechoice.id)}
          <RoutechoiceTrack {routechoice} opacity={0.8} width={6} />
        {/each}
      {/if}

      {#if isAutoAnalysisMode}
        <AutoAnalysis
          {selectedRunners}
          {legNumber}
          runners={courseData.runners}
        />
      {:else}
        {#each courseData.runners as runner (runner.id)}
          {@const show = selectedRunners.includes(runner.id)}

          {#if show && runner.track !== null}
            <RunnerRoute {runner} {legNumber} />
          {/if}
        {/each}
      {/if}
    </VectorLayer>
  </OlMap>

  <ActionButtons
    bind:legNumber
    bind:showRoutechoices
    bind:showSideBar
    legs={courseData.legs}
    bind:isAutoAnalysisMode
  />
</div>

<style>
  .wrapper {
    position: relative;
    flex-shrink: 0;
    flex-grow: 1;
  }
</style>
