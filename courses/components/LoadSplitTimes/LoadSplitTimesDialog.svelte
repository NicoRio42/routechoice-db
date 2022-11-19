<script lang="ts">
  import { getFirestore } from "firebase/firestore/lite";
  import { fade } from "svelte/transition";
  import { updateRunnersInFirestore } from "../../../shared/db/runners";
  import type { Mapviewer } from "../../../shared/o-utils/models/2d-rerun/mapviewer";
  import type Runner from "../../../shared/o-utils/models/runner";
  import { detectRunnersRoutechoices } from "../../../shared/o-utils/routechoice-detector/routechoice-detector";
  import { parseIOFXML3SplitTimesFile } from "../../../shared/o-utils/split-times/parsers/iof-xml-3";
  import {
    attribute2DRerunTrackToMatchedRunner,
    matchRunnersByName,
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
  // @ts-ignore
  const mapViewer: Mapviewer = mapviewer;

  let step = 1;
  let automaticallyAttributedRunners: Runner[];

  const parseIOFXML = (event: CustomEvent<SplitSubmitEvent>) => {
    const { xmlDoc, className, timeZone, timeOffset } = event.detail;

    try {
      const rawRunners = parseIOFXML3SplitTimesFile(
        xmlDoc,
        className,
        timeZone,
        timeOffset
      );

      const matchedRunners = matchRunnersByName(rawRunners, mapViewer.routes);

      automaticallyAttributedRunners = attribute2DRerunTrackToMatchedRunner(
        matchedRunners,
        mapViewer.routes
      );
    } catch (error) {
      alert("An error occured while parsing the split times.");
      console.error(error);
      return;
    }

    step = 4;
  };

  const saveSplitTimes = async (event: CustomEvent<{ runners: Runner[] }>) => {
    let { runners } = event.detail;
    runners = detectRunnersRoutechoices($courseData.legs, runners);

    // So the runner track is not persisted to Firebase
    runners.forEach((runner) => (runner.track = null));

    // TODO reimplement statistics

    try {
      updateRunnersInFirestore(db, $courseData.runners, runners, $course.data);
    } catch (error) {
      alert("An error occured while updating the new runners to the database.");
      console.error(error);
    }

    loadRunnersSplitsTo2dRerun(runners);
    $courseData.runners = runners;
    isDialogOpen = false;
  };
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
      />
    {/if}

    {#if step === 3}
      <LoadSplitTimesFromFileForm
        on:previous={() => (step = 1)}
        on:submit={parseIOFXML}
      />
    {/if}

    {#if step === 4}
      <RunnerMatcher
        runners={automaticallyAttributedRunners}
        on:previous={() => (step = 1)}
        on:submit={saveSplitTimes}
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
