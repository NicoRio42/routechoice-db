<script lang="ts">
  import type { LineString } from "ol/geom";
  import type { DrawEvent } from "ol/interaction/Draw";
  import type Routechoice from "shared/o-utils/models/routechoice";
  import { detectRunnersRoutechoices } from "../../../shared/o-utils/routechoice-detector/routechoice-detector";
  import type CourseData from "../../../shared/o-utils/models/course-data";
  import { changeRunnerRoutechoice } from "../../db/routechoice";
  import ActionButtons from "./components/ActionButtons.svelte";
  import AddRoutechoiceDialog, {
    getNewRoutechoiceNameAndColor,
  } from "./components/AddRoutechoiceDialog.svelte";
  import AutoAnalysis from "./components/AutoAnalysis.svelte";
  import Draw from "./components/Draw.svelte";
  import GeoreferencedImage from "./components/GeoreferencedImage/GeoreferencedImage.svelte";
  import OlMap from "./components/OLMap.svelte";
  import OSM from "./components/OSM.svelte";
  import RoutechoiceTrack from "./components/RoutechoiceTrack.svelte";
  import RunnerRoute from "./components/RunnerRoute.svelte";
  import SideBar from "./components/SideBar.svelte";
  import type { RoutechoiceChangeEventDetails } from "./components/SplitTimesTable/RoutecoiceTableCell.svelte";
  import { getStandardCordsAndLengthFromLineStringFlatCordinates } from "./components/utils";
  import VectorLayer from "./components/VectorLayer.svelte";
  import "./styles.css";
  import { computeFitBoxAndAngleFromLegNumber } from "./utils";
  import { doc, getFirestore, writeBatch } from "firebase/firestore/lite";

  export let courseData: CourseData;

  const db = getFirestore();

  let angle: number;
  let fitBox: [number, number, number, number];
  let legNumber = 1;
  let selectedRunners: string[] = [];
  let showRoutechoices = true;
  let showSideBar = true;
  let isAutoAnalysisMode = false;
  let isDrawMode = false;

  $: {
    const [newFitBox, newAngle] = computeFitBoxAndAngleFromLegNumber(
      legNumber,
      courseData
    );

    fitBox = newFitBox;
    angle = newAngle;
  }

  $: legRoutechoices = courseData.legs[legNumber - 1].routechoices;

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

  async function handleDrawEnd(e: CustomEvent<DrawEvent>): Promise<void> {
    try {
      const [name, color] = await getNewRoutechoiceNameAndColor();

      const [track, length] =
        getStandardCordsAndLengthFromLineStringFlatCordinates(
          (e.detail.feature.getGeometry() as LineString).getFlatCoordinates()
        );

      const newRoutechoice: Routechoice = {
        id: crypto.randomUUID(),
        color,
        name,
        length,
        track,
      };

      courseData.legs[legNumber - 1].routechoices = [
        ...courseData.legs[legNumber - 1].routechoices,
        newRoutechoice,
      ];

      if (courseData.runners.length !== 0) {
        const runnersWithDetectedRoutechoices = detectRunnersRoutechoices(
          courseData.legs,
          courseData.runners
        );

        // So the runner track is not persisted to Firebase
        runnersWithDetectedRoutechoices.forEach(
          (runner) => (runner.track = null)
        );

        // Only updated runners are pushed to Firestore
        const updatedRunner = runnersWithDetectedRoutechoices.filter(
          (newRunner, runnerIndex) =>
            courseData.runners[runnerIndex].legs.some(
              (oldRunnerLeg, legIndex) => {
                return (
                  newRunner.legs[legIndex]?.detectedRouteChoice?.id !==
                  oldRunnerLeg?.detectedRouteChoice?.id
                );
              }
            )
        );

        try {
          const batch = writeBatch(db);

          updatedRunner.forEach(async (runner) => {
            batch.update(
              doc(db, "coursesData", courseData.id, "runners", runner.id),
              { legs: runner.legs }
            );

            console.log(
              `Runner ${runner.firstName} ${runner.lastName} updated`
            );
          });

          batch.commit();
        } catch (error) {
          alert(
            "An error occured while updating the new runners to the database."
          );
          console.error(error);
        }

        courseData.runners = runnersWithDetectedRoutechoices;
      }
    } catch (e) {
      return;
    }
  }
</script>

<div class="wrapper">
  <AddRoutechoiceDialog {legRoutechoices} />

  <SideBar
    bind:selectedRunners
    {courseData}
    {legNumber}
    {showSideBar}
    on:routechoiceChange={handleRoutechoiceChange}
  />

  <OlMap {isDrawMode} {angle} {fitBox} padding={[100, 0, 100, 0]}>
    <OSM />

    <label for="draw-switch" class="draw-switch-label">
      <p>Draw routechoices</p>

      <input
        type="checkbox"
        bind:checked={isDrawMode}
        role="switch"
        class="draw-switch"
      />
    </label>

    {#if courseData.map !== null}
      <GeoreferencedImage
        url={courseData.map.url}
        mapCalibration={courseData.map.calibration}
      />
    {/if}

    <VectorLayer>
      {#if showRoutechoices}
        {#each legRoutechoices as routechoice (routechoice.id)}
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

      {#if isDrawMode}
        <Draw type={"LineString"} on:drawEnd={handleDrawEnd} />
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
  .draw-switch {
    position: absolute;
    top: 6rem;
    right: 0;
  }
</style>
