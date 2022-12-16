<script lang="ts">
  import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
  import { serializeNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import type Routechoice from "../../../shared/o-utils/models/routechoice";
  import type Runner from "../../../shared/o-utils/models/runner";
  import { createRoutechoiceStatisticsForOneLeg } from "../../../shared/o-utils/statistics/routechoices-statistics";
  import userStore, {
    isUserAdminStore,
  } from "../../../shared/stores/user-store";
  import courseData from "../../stores/course-data";
  import selectedLeg from "../../stores/selected-leg";

  export let routechoices: Routechoice[] = [];
  export let runner: Runner;

  $: selectedRoutechoice =
    runner.legs[0]?.manualRouteChoice?.id ??
    runner.legs[0]?.detectedRouteChoice?.id ??
    null;

  let loading = false;

  const db = getFirestore();

  $: selectedRoutechoiceColor = routechoices.find(
    (r) => r.id === selectedRoutechoice
  )?.color;

  async function handleChange(
    event: Event & {
      currentTarget: EventTarget & HTMLSelectElement;
    }
  ) {
    if (!confirm("Are you sure to manually change this runner routechoice?")) {
      event.currentTarget.value =
        selectedRoutechoice === null ? "" : selectedRoutechoice.toString();

      return;
    }

    const newSelectedRoutechoiceId = parseInt(event.currentTarget.value, 10);

    selectedRoutechoice = isNaN(newSelectedRoutechoiceId)
      ? null
      : newSelectedRoutechoiceId;

    if ($selectedLeg === null) return;

    const routechoice = routechoices.find((r) => r.id === selectedRoutechoice);

    if (routechoice === undefined) {
      console.warn("Cannot find back routechoice to update.");
      return;
    }

    const completeRunner = $courseData.runners.find((r) => r.id === runner.id);

    if (completeRunner === undefined) {
      console.warn("Cannot find back runner to update.");
      return;
    }

    const routechoiceToAttribute = structuredClone(routechoice);
    delete routechoiceToAttribute.statistics;
    routechoiceToAttribute.track = [];
    const legToUpdate = completeRunner.legs[$selectedLeg - 1];
    if (legToUpdate === null) return;
    legToUpdate.manualRouteChoice = routechoiceToAttribute;

    // Update legs routechoices stats
    $courseData.legs[$selectedLeg - 1] = createRoutechoiceStatisticsForOneLeg(
      $courseData.legs[$selectedLeg - 1],
      $selectedLeg,
      $courseData.runners
    );

    loading = true;

    try {
      await updateDoc(
        doc(db, "coursesData", $courseData.id, "runners", runner.id),
        { legs: completeRunner.legs }
      );

      await updateDoc(doc(db, "coursesData", $courseData.id), {
        legs: serializeNestedArraysInLegs($courseData.legs),
      });
    } catch (error) {
      alert("An error occured while manually updating the routechoice.");
      console.error(error);
    } finally {
      loading = false;
    }
  }
</script>

<td aria-busy={loading} class="right">
  {#if runner.legs !== null && runner.legs[0] !== null}
    {#if $isUserAdminStore || runner.foreignKeys.userId === $userStore?.uid}
      <select
        style:color={selectedRoutechoiceColor}
        value={selectedRoutechoice}
        on:change={handleChange}
        disabled={loading}
      >
        <option value={null} />

        {#each routechoices as routechoice}
          <option style:color={routechoice.color} value={routechoice.id}
            >{routechoice.name}</option
          >
        {/each}
      </select>
    {:else if runner.legs[0].manualRouteChoice !== null}
      <strong style:color={runner.legs[0]?.manualRouteChoice.color}
        >{runner.legs[0].manualRouteChoice.name}</strong
      >
    {:else if runner.legs[0].detectedRouteChoice !== null}
      <strong style:color={runner.legs[0]?.detectedRouteChoice.color}
        >{runner.legs[0].detectedRouteChoice.name}</strong
      >
    {/if}
  {/if}
</td>

<style>
  select {
    margin: 0;
    width: 2rem;
    padding: 0.125rem 0.25rem;
    background-position: center right 0;
  }

  .right {
    text-align: end;
  }
</style>
