<script lang="ts">
  import courseData from "../../stores/course-data";
  import type { Mapviewer } from "../../../shared/o-utils/models/2d-rerun/mapviewer";
  import { selectHack } from "../../utils/2d-rerun-hacks/select-hack";
  import { map2DRerunTagToRoutechoice } from "../../../shared/o-utils/two-d-rerun/course-mappers";
  import { findRoutechoiceLegIndex } from "../../../shared/o-utils/utils/routechoice-leg-attributer";
  import { serializeNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
  import course from "../../stores/course";
  import { attribute2DRerunTrackToMatchedRunner } from "../../../shared/o-utils/two-d-rerun/runners-matcher";
  import { detectRunnersRoutechoices } from "../../../shared/o-utils/routechoice-detector/routechoice-detector";
  import { updateRunnersInFirestore } from "../../../shared/db/runners";
  import { createRoutechoiceStatistics } from "../../../shared/o-utils/statistics/routechoices-statistics";

  const db = getFirestore();

  let isEditing = false;
  let loading = false;

  function handleAddNewRoutechoicesClick() {
    isEditing = true;

    selectHack("selectmode", "analyzecourse");
    selectHack("tagmodechoose", "3");
  }

  async function handleSaveNewRoutecoicesClick() {
    loading = true;

    selectHack("selectmode", "analyzecourse");
    selectHack("tagmodechoose", "0");

    const routechoices = $courseData.legs.flatMap((leg) => leg.routechoices);

    // @ts-ignore
    const mapViewer: Mapviewer = mapviewer;

    const newTags = mapViewer.tags.filter((tag) => {
      return routechoices.every((rc) => {
        const [tagLat, tagLon] = tag.points[0]
          .split(",")
          .map((c) => parseFloat(c));

        const [rcLat, rcLong] = rc.track[0];

        return tagLat !== rcLat || tagLon !== rcLong || tag.name !== rc.name;
      });
    });

    const newRoutechoices = newTags.map((t) =>
      map2DRerunTagToRoutechoice(t, Math.floor(Math.random() * 10e10))
    );

    const legs = structuredClone($courseData.legs);

    newRoutechoices.forEach((rc) => {
      const legIndex = findRoutechoiceLegIndex(rc, legs);
      legs[legIndex].routechoices.push(rc);
    });

    $courseData.legs = legs;

    // Re-detect routechoices
    if ($courseData.runners.length !== 0) {
      const automaticallyAttributedRunners =
        attribute2DRerunTrackToMatchedRunner(
          $courseData.runners,
          mapViewer.routes
        );

      const runnersWithDetectedRoutechoices = detectRunnersRoutechoices(
        $courseData.legs,
        automaticallyAttributedRunners
      );

      // So the runner track is not persisted to Firebase
      runnersWithDetectedRoutechoices.forEach(
        (runner) => (runner.track = null)
      );

      // Only updated runners are pushed to Firestore
      const updatedRunner = runnersWithDetectedRoutechoices.filter(
        (newRunner, runnerIndex) =>
          $courseData.runners[runnerIndex].legs.some(
            (oldRunnerLeg, legIndex) => {
              return (
                newRunner.legs[legIndex]?.detectedRouteChoice?.id !==
                oldRunnerLeg?.detectedRouteChoice?.id
              );
            }
          )
      );

      try {
        // TODO batch these updates
        updatedRunner.forEach(async (runner) => {
          await updateDoc(
            doc(db, "coursesData", $course.data, "runners", runner.id),
            { legs: runner.legs }
          );

          console.log(`Runner ${runner.firstName} ${runner.lastName} updated`);
        });
      } catch (error) {
        alert(
          "An error occured while updating the new runners to the database."
        );
        console.error(error);
      }

      $courseData.runners = runnersWithDetectedRoutechoices;
    }

    $courseData.legs = createRoutechoiceStatistics(
      $courseData.runners,
      $courseData.legs
    );

    try {
      await updateDoc(doc(db, "coursesData", $course.data), {
        legs: serializeNestedArraysInLegs($courseData.legs),
      });
    } catch (error) {
      alert("An error occured while updating the course.");
    } finally {
      loading = false;
      isEditing = false;
    }
  }
</script>

{#if !isEditing}
  <button
    class="add-routechoice-button outline"
    on:click={handleAddNewRoutechoicesClick}
  >
    Add routechoices
  </button>
{/if}

{#if isEditing}
  <button
    aria-busy={loading}
    disabled={loading}
    class="add-routechoice-button outline"
    on:click={handleSaveNewRoutecoicesClick}
  >
    Save new routechoices
  </button>
{/if}

<style>
  .add-routechoice-button {
    height: auto;
    padding: var(--nav-link-spacing-vertical) var(--nav-link-spacing-horizontal);
  }
</style>
