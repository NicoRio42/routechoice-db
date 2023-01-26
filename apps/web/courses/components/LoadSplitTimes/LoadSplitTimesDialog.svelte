<script lang="ts">
  import { getAuth } from "firebase/auth";
  import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
  import { getFunctions, httpsCallable } from "firebase/functions";
  import { fade } from "svelte/transition";
  import { functionsBaseURL } from "../../../environments/environment";
  import { updateRunnersInFirestore } from "../../../shared/db/runners";
  import type User from "../../../shared/models/user";
  import type { Mapviewer } from "../../../shared/o-utils/models/2d-rerun/mapviewer";
  import { serializeNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import type Runner from "../../../shared/o-utils/models/runner";
  import { detectRunnersRoutechoices } from "../../../shared/o-utils/routechoice-detector/routechoice-detector";
  import { parseIOFXML3SplitTimesFile } from "../../../shared/o-utils/split-times/parsers/iof-xml-3";
  import { createRoutechoiceStatistics } from "../../../shared/o-utils/statistics/routechoices-statistics";
  import {
    attribute2DRerunTrackToMatchedRunner,
    matchRunnersByName,
    type RunnerForMatching,
  } from "../../../shared/o-utils/two-d-rerun/runners-matcher";
  import clickOutside from "../../../shared/use/clickOutside";
  import course from "../../stores/course";
  import courseData from "../../stores/course-data";
  import { loadRunnersSplitsTo2dRerun } from "../../utils/2d-rerun-hacks/load-splits-to-2d-rerun";
  import LoadSplitTimesFromFileForm from "./LoadSplitTimesFromFileForm.svelte";
  import LoadSplitTimesFromWinsplitForm from "./LoadSplitTimesFromWinsplitForm.svelte";
  import type { SplitSubmitEvent } from "./models/split-submit-event";
  import RunnerMatcher from "./RunnerMatcher.svelte";

  export let isDialogOpen = false;

  const db = getFirestore();
  const auth = getAuth();
  const functions = getFunctions(undefined, "europe-west1");
  const getUserList = httpsCallable(functions, "getUserList");
  // @ts-ignore
  const mapViewer: Mapviewer = mapviewer;

  let step = 1;
  let automaticallyAttributedRunners: Runner[];
  let usersForMatching: RunnerForMatching[] = [];
  let loading = false;

  async function parseIOFXML(event: CustomEvent<SplitSubmitEvent>) {
    const { xmlDoc, className, timeZone, timeOffset } = event.detail;
    loading = true;

    try {
      const rawRunners = parseIOFXML3SplitTimesFile(
        xmlDoc,
        className,
        timeZone,
        timeOffset
      );

      const authorization = "Bearer " + (await auth.currentUser?.getIdToken());

      const usersResponse = await fetch(
        `${functionsBaseURL}/getUserListOnRequest`,
        {
          headers: {
            authorization,
          },
        }
      );

      const users = (await usersResponse.json()) as unknown as User[];

      usersForMatching = users
        .map((u) => ({
          name: u.displayName ?? u.email.split("@")[0].replace(".", " ") ?? "",
          foreignKey: u.id,
        }))
        .sort((userA, userB) => userA.name.localeCompare(userB.name));

      const matchedRunnersWithUsers = matchRunnersByName(
        rawRunners,
        "userId",
        usersForMatching
      );

      const routesForMatching: RunnerForMatching[] = mapViewer.routes.map(
        (r) => ({ name: r.runnername, foreignKey: r.indexnumber })
      );

      const matchedRunners = matchRunnersByName(
        matchedRunnersWithUsers,
        "twoDRerunRouteIndexNumber",
        routesForMatching
      );

      automaticallyAttributedRunners = attribute2DRerunTrackToMatchedRunner(
        matchedRunners,
        mapViewer.routes
      );
    } catch (error) {
      alert("An error occured while parsing the split times.");
      console.error(error);
      return;
    } finally {
      loading = false;
    }

    step = 4;
  }

  async function saveSplitTimes(event: CustomEvent<{ runners: Runner[] }>) {
    loading = true;
    let { runners } = event.detail;

    try {
      runners = detectRunnersRoutechoices($courseData.legs, runners);
    } catch (error) {
      console.error(error);
      alert(`An error occured while detecting runners routechoices.\n${error}`);
      loading = false;
      return;
    }

    // So the runner track is not persisted to Firebase
    runners.forEach((runner) => (runner.track = null));

    $courseData.legs = createRoutechoiceStatistics(runners, $courseData.legs);

    try {
      updateRunnersInFirestore(db, $courseData.runners, runners, $course.data);

      await updateDoc(doc(db, "coursesData", $course.data), {
        legs: serializeNestedArraysInLegs($courseData.legs),
      });
    } catch (error) {
      alert("An error occured while updating the new runners to the database.");
      console.error(error);
    }

    loadRunnersSplitsTo2dRerun(runners);
    $courseData.runners = runners;
    isDialogOpen = false;
  }
</script>

<dialog open>
  <article use:clickOutside={() => (isDialogOpen = false)} transition:fade>
    <header>
      <a
        aria-label="Close"
        class="close"
        on:click={() => (isDialogOpen = false)}
      />

      <strong>Upload split times</strong>
    </header>

    {#if step === 1}
      <div class="options-wrapper">
        <article class="upload-option" on:click={() => (step = 3)}>
          Upload from IOF XML file
        </article>

        <article class="upload-option" on:click={() => (step = 2)}>
          Upload from Winsplit
        </article>
      </div>

      <footer>
        <button on:click={() => (isDialogOpen = false)}>Cancel</button>
      </footer>
    {/if}

    {#if step === 2}
      <LoadSplitTimesFromWinsplitForm
        on:previous={() => (step = 1)}
        on:submit={parseIOFXML}
        {loading}
      />
    {/if}

    {#if step === 3}
      <LoadSplitTimesFromFileForm
        on:previous={() => (step = 1)}
        on:submit={parseIOFXML}
        {loading}
      />
    {/if}

    {#if step === 4}
      <RunnerMatcher
        runners={automaticallyAttributedRunners}
        users={usersForMatching}
        on:previous={() => (step = 1)}
        on:submit={saveSplitTimes}
        {loading}
      />
    {/if}
  </article>
</dialog>

<style>
  .options-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .upload-option {
    cursor: pointer;
    margin: 0;
  }
</style>
