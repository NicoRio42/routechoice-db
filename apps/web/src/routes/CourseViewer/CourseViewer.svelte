<script lang="ts">
  import { transform, transformExtent } from "ol/proj";
  import type CourseData from "shared/o-utils/models/course-data";
  import ActionButtons from "./components/ActionButtons.svelte";
  import OlMap from "./components/OLMap.svelte";
  import OSM from "./components/OSM.svelte";
  import GeoreferencedImage from "./components/GeoreferencedImage/GeoreferencedImage.svelte";
  import RoutechoiceTrack from "./components/RoutechoiceTrack.svelte";
  import RunnerRoute from "./components/RunnerRoute.svelte";
  import SideBar from "./components/SideBar.svelte";
  import VectorLayer from "./components/VectorLayer.svelte";
  import "./styles.css";
  import type { RoutechoiceChangeEventDetails } from "./components/SplitTimesTable/RoutecoiceTableCell.svelte";

  export let courseData: CourseData;

  let angle: number;
  let fitBox: [number, number, number, number];
  let legNumber = 1;
  let selectedRunners = courseData.runners.map((runner) => runner.id);
  let showRoutechoices = true;
  let showSideBar = true;

  $: {
    const [newFitBox, newAngle] = computeFitBoxAndAngleFromLegNumber(
      legNumber,
      courseData
    );

    fitBox = newFitBox;
    angle = newAngle;
  }

  function computeFitBoxAndAngleFromLegNumber(
    legNumber: number,
    courseData: CourseData
  ): [[number, number, number, number], number] {
    const leg = courseData.legs[legNumber - 1];
    if (leg === undefined) throw new Error("Cannot find leg");

    const finishControl = courseData.course.find(
      (control) => control.code === leg.finishControlCode
    );

    if (finishControl === undefined)
      throw new Error("Cannot find finish control");

    const minLat = Math.min(leg.startLat, finishControl.lat);
    const maxLat = Math.max(leg.startLat, finishControl.lat);
    const minLon = Math.min(leg.startLon, finishControl.lon);
    const maxLon = Math.max(leg.startLon, finishControl.lon);

    const extend = transformExtent(
      [minLon, minLat, maxLon, maxLat],
      "EPSG:4326",
      "EPSG:3857"
    );

    const startControlWebMarcator = transform(
      [leg.startLon, leg.startLat],
      "EPSG:4326",
      "EPSG:3857"
    );

    const finishControlWebMercator = transform(
      [finishControl.lon, finishControl.lat],
      "EPSG:4326",
      "EPSG:3857"
    );

    const deltaX = finishControlWebMercator[0] - startControlWebMarcator[0];
    const deltaY = finishControlWebMercator[1] - startControlWebMarcator[1];

    const newAngle = -Math.atan(deltaX / deltaY) - (deltaY > 0 ? 0 : Math.PI);

    return [extend as [number, number, number, number], newAngle];
  }

  function handleRoutechoiceChange(
    event: CustomEvent<RoutechoiceChangeEventDetails>
  ) {
    console.log("changing routechoice for runnur id " + event.detail.runnerId);

    // const routechoice = routechoices.find((r) => r.id === selectedRoutechoice);

    // if (routechoice === undefined) {
    //   console.warn("Cannot find back routechoice to update.");
    //   return;
    // }

    // const completeRunner = $courseData.runners.find((r) => r.id === runner.id);

    // if (completeRunner === undefined) {
    //   console.warn("Cannot find back runner to update.");
    //   return;
    // }

    // const routechoiceToAttribute = structuredClone(routechoice);
    // delete routechoiceToAttribute.statistics;
    // routechoiceToAttribute.track = [];
    // const legToUpdate = completeRunner.legs[$selectedLeg - 1];
    // if (legToUpdate === null) return;
    // legToUpdate.manualRouteChoice = routechoiceToAttribute;

    // // Update legs routechoices stats
    // $courseData.legs[$selectedLeg - 1] = createRoutechoiceStatisticsForOneLeg(
    //   $courseData.legs[$selectedLeg - 1],
    //   $selectedLeg,
    //   $courseData.runners
    // );

    // loading = true;

    // try {
    //   await updateDoc(
    //     doc(db, "coursesData", $courseData.id, "runners", runner.id),
    //     { legs: completeRunner.legs }
    //   );

    //   await updateDoc(doc(db, "coursesData", $courseData.id), {
    //     legs: serializeNestedArraysInLegs($courseData.legs),
    //   });
    // } catch (error) {
    //   alert("An error occured while manually updating the routechoice.");
    //   console.error(error);
    // } finally {
    //   loading = false;
    // }
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
      {#each courseData.runners as runner}
        {@const show = selectedRunners.includes(runner.id)}

        {#if show}
          <RunnerRoute {runner} {legNumber} />
        {/if}
      {/each}
    </VectorLayer>

    <VectorLayer>
      {#if showRoutechoices}
        {@const routechoices = courseData.legs[legNumber - 1].routechoices}

        {#each routechoices as routechoice (routechoice.id)}
          <RoutechoiceTrack {routechoice} opacity={0.8} width={6} />
        {/each}
      {/if}
    </VectorLayer>
  </OlMap>

  <ActionButtons
    bind:legNumber
    bind:showRoutechoices
    bind:showSideBar
    legs={courseData.legs}
  />
</div>

<style>
  .wrapper {
    position: relative;
    flex-shrink: 0;
    flex-grow: 1;
  }
</style>
