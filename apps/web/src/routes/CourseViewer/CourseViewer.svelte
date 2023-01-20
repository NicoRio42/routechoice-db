<script lang="ts">
  import type Control from "shared/o-utils/models/control";
  import type CourseData from "shared/o-utils/models/course-data";
  import ControlSelector from "./components/ControlSelector.svelte";
  import OlMap from "./components/OLMap.svelte";
  import RasterImage from "./components/RasterImage.svelte";
  import RoutechoiceTrack from "./components/RoutechoiceTrack.svelte";
  import RunnerRoute from "./components/RunnerRoute.svelte";
  import SideBar from "./components/SideBar.svelte";
  import VectorLayer from "./components/VectorLayer.svelte";

  export let courseData: CourseData;

  let angle = 0;
  let fitBox: [number, number, number, number];
  let controlNumber = 1;
  let selectedRunners = courseData.runners.map((runner) => runner.id);
  let showRoutechoices = true;
  let showSideBar = true;

  $: {
    const [newFitBox, newAngle] = computeFitBoxAndAngleFromControlNumber(
      controlNumber,
      courseData.course
    );

    fitBox = newFitBox;
    angle = newAngle;
  }

  function computeFitBoxAndAngleFromControlNumber(
    controlNumber: number,
    course: Control[]
  ): [[number, number, number, number], number] {
    // TODO
    return [[0, 1, 0, 1], 0];
  }
</script>

{#if showSideBar}
  <SideBar bind:selectedRunners runners={courseData.runners} />
{/if}

<OlMap {angle} {fitBox}>
  {#if courseData.map !== null}
    <RasterImage
      url={courseData.map.url}
      mapCalibration={courseData.map.calibration}
    />
  {/if}

  <VectorLayer>
    {#each courseData.runners as runner}
      {@const show = selectedRunners.includes(runner.id)}

      {#if show}
        <RunnerRoute {runner} {controlNumber} />
      {/if}
    {/each}
  </VectorLayer>

  <VectorLayer>
    {#if showRoutechoices}
      {@const routechoices = courseData.legs[controlNumber - 1].routechoices}

      {#each routechoices as routechoice}
        <RoutechoiceTrack {routechoice} />
      {/each}
    {/if}
  </VectorLayer>
</OlMap>

<ControlSelector
  bind:controlNumber
  bind:showRoutechoices
  bind:showSideBar
  course={courseData.course}
/>
