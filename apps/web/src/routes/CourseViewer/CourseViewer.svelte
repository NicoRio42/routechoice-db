<script lang="ts">
  import {
    doc,
    getFirestore,
    updateDoc,
    writeBatch,
  } from "firebase/firestore/lite";
  import type { LineString } from "ol/geom";
  import type { DrawEvent } from "ol/interaction/Draw";
  import { serializeNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import type Routechoice from "shared/o-utils/models/routechoice";
  import { createRoutechoiceStatistics } from "../../../shared/o-utils/statistics/routechoices-statistics";
  import type CourseData from "../../../shared/o-utils/models/course-data";
  import {
    detectRunnersRoutechoices,
    detectSingleRunnerRoutechoices,
  } from "../../../shared/o-utils/routechoice-detector/routechoice-detector";
  import { changeRunnerRoutechoice } from "../../db/routechoice";
  import { updateRunnersRoutechoicesInFirestore } from "../../db/runners";
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
  import RunnerOffsetEditor, {
    getNewRunnerOffset,
  } from "./components/RunnerOffsetEditor.svelte";

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

  async function handleRoutechoiceChange(
    event: CustomEvent<RoutechoiceChangeEventDetails>
  ): Promise<void> {
    courseData = await changeRunnerRoutechoice(
      courseData,
      event.detail.routechoiceID,
      event.detail.runnerId,
      legNumber,
      db
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

      courseData.legs = createRoutechoiceStatistics(
        courseData.runners,
        courseData.legs
      );

      try {
        await updateDoc(doc(db, "coursesData", courseData.id), {
          legs: serializeNestedArraysInLegs(courseData.legs),
        });
      } catch (error) {
        alert("An error occured while updating the course.");
      }

      if (courseData.runners.length !== 0) {
        const runnersWithDetectedRoutechoices = detectRunnersRoutechoices(
          courseData.legs,
          courseData.runners
        );

        try {
          updateRunnersRoutechoicesInFirestore(
            courseData.runners,
            runnersWithDetectedRoutechoices,
            db,
            courseData.id
          );

          courseData.runners = runnersWithDetectedRoutechoices;
        } catch (error) {
          alert(
            "An error occured while updating the new runners to the database."
          );
          console.error(error);
        }
      }
    } catch (e) {
      return;
    }
  }

  async function handleRunnerTimeOffsetChange(
    event: CustomEvent<string>
  ): Promise<void> {
    const runnerId = event.detail;
    const previouslySelectedRunners = [...selectedRunners];
    selectedRunners = [runnerId];
    let newOffset: number, applyToAllRunners: boolean;

    try {
      [newOffset, applyToAllRunners] = await getNewRunnerOffset(runnerId);
    } catch (e) {
      return;
    } finally {
      selectedRunners = [...previouslySelectedRunners];
    }

    if (applyToAllRunners) {
      courseData.runners.forEach((runner) => (runner.timeOffset = newOffset));

      courseData.runners = detectRunnersRoutechoices(
        courseData.legs,
        courseData.runners
      );

      const batch = writeBatch(db);

      courseData.runners.forEach((runner) =>
        batch.update(
          doc(db, "coursesData", courseData.id, "runners", runner.id),
          {
            timeOffset: newOffset,
            legs: runner.legs,
          }
        )
      );

      batch.commit();
      return;
    }

    const runner = courseData.runners.find((runner) => runner.id === runnerId)!;
    const runnerWithNewOssetAndDetectedRoutechoice =
      detectSingleRunnerRoutechoices(courseData.legs, {
        ...runner,
        timeOffset: newOffset,
      });

    courseData.runners = courseData.runners.map((runner) =>
      runner.id === runnerId ? runnerWithNewOssetAndDetectedRoutechoice : runner
    );

    updateDoc(doc(db, "coursesData", courseData.id, "runners", runnerId), {
      ...runnerWithNewOssetAndDetectedRoutechoice,
    });
  }
</script>

<div class="wrapper">
  <AddRoutechoiceDialog {legRoutechoices} />

  <RunnerOffsetEditor bind:courseData />

  <SideBar
    bind:selectedRunners
    {courseData}
    {legNumber}
    {showSideBar}
    on:routechoiceChange={handleRoutechoiceChange}
    on:changeRunnerTimeOffset={handleRunnerTimeOffsetChange}
  />

  <OlMap {isDrawMode} {angle} {fitBox} padding={[100, 0, 100, 0]}>
    <!-- <OSM /> -->

    {#if isDrawMode}
      <Draw type={"LineString"} on:drawEnd={handleDrawEnd} />
    {/if}

    <input
      type="checkbox"
      bind:checked={isDrawMode}
      role="switch"
      class="draw-switch"
    />

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

  @media screen and (max-width: 768px) {
    .draw-switch {
      display: none;
    }
  }
</style>
