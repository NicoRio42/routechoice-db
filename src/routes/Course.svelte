<script>
  import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

  import Dialog from "../components/Dialog.svelte";
  import Gear from "../components/icons/Gear.svelte";
  import LegSelector from "../components/LegSelector.svelte";
  import LoadSplitTimes from "../components/LoadSplitTimes.svelte";
  import LegSplitTimesTable from "../components/SplitTimesTable/LegSplitTimesTable.svelte";
  import Statistics from "../components/Statistics.svelte";
  import Toggle from "../components/Toggle.svelte";
  import { userStore } from "../stores/user-store";
  import { getMapviewer } from "../utils/2d-rerun-hacks/get-mapviewer";
  import {
    buildCourseAndRoutechoices,
    initMapviewer,
  } from "../utils/2d-rerun-hacks/init-mapviewer";
  import { loadSplitsTo2dRerun } from "../utils/2d-rerun-hacks/load-splits-to-2d-rerun";
  import { selectHack } from "../utils/2d-rerun-hacks/select-hack";
  import { IOFXMLParser } from "../utils/iof-xml-parser/IOFXMLParser";
  import { detectRunnersRoutechoices } from "../utils/routechoices-detector/detect-route";

  export let params = {};

  let isLoadSplitsDialogOpen = false;
  let isInSplitMode = true;
  let loadingSaveToServer = false;
  let course;
  let loadCourseAndRoutechoicesFromJsonInput;

  const db = getFirestore();

  /**@type {IOFXMLParser}*/
  let splitTimes = { runners: [], routeChoicesStatistics: [] };
  let legNumber = 1;

  /**@type {number}*/
  let numberOfContols;

  /**@type {HTMLIFrameElement}*/
  let iframe;

  /**@type {import("../models/mapviewer").Mapviewer}*/
  let mapviewer;
  let showSidePanel = !navigator.userAgentData.mobile;

  async function iframeLoaded() {
    mapviewer = getMapviewer(iframe);

    const docSnap = await getDoc(doc(db, "courses", params.courseId));

    if (docSnap.data() === undefined) {
      alert("An error occured while loading course data.");
      return;
    }

    course = docSnap.data();

    await initMapviewer(mapviewer, iframe, course);

    if (course.courseAndRoutechoices === undefined) {
      return;
    }

    numberOfContols = course.courseAndRoutechoices.coursecoords.length - 1;
    setTimeout(propagateLegChangeTo2DRerun, 3000);

    if (course.splitTimes === undefined) {
      return;
    }

    Object.keys(course.splitTimes).forEach(
      (key) => (splitTimes[key] = course.splitTimes[key])
    );

    detectRoutechoices();
    loadSplitsTo2dRerun(iframe, mapviewer, splitTimes);
  }

  const togle2dRerunPanel = () => {
    if (iframe) {
      let rightmenu = iframe.contentDocument.getElementById("rightmenu");
      rightmenu.style.display =
        rightmenu.style.display === "block" ? "none" : "block";
    }
  };

  function propagateLegChangeTo2DRerun() {
    if (!legNumber) {
      return;
    }

    selectHack(iframe, "selectmode", "analyzecourse");
    iframe.contentDocument.getElementById(`ac-${legNumber}`).click();
  }

  const detectRoutechoices = () => {
    splitTimes.runners = detectRunnersRoutechoices(
      splitTimes.runners,
      mapviewer,
      mapviewer.routes
    );
  };

  function loadCourseAndRoutechoicesFromJson(event) {
    let reader = new FileReader();

    reader.onload = function (e) {
      const data = JSON.parse(e.target.result);
      buildCourseAndRoutechoices(mapviewer, iframe, data);
      course.courseAndRoutechoices = data;
      numberOfContols = course.courseAndRoutechoices.coursecoords.length - 1;
      propagateLegChangeTo2DRerun();
    };

    reader.readAsText(event.target.files[0]);
  }

  async function saveToServer() {
    if (course === undefined) {
      alert("Nothing to save");
      return;
    }

    loadingSaveToServer = true;
    await setDoc(doc(db, "courses", params.courseId), course);
    loadingSaveToServer = false;
  }

  function handleLoadSplitsClick() {
    if (numberOfContols === undefined) {
      alert("You sould draw a course first.");
      return;
    }

    isLoadSplitsDialogOpen = true;
  }

  function handleSplitDialogSubmit() {
    isLoadSplitsDialogOpen = false;
    detectRoutechoices();
    splitTimes.computeRoutechoicesStatistics();
    loadSplitsTo2dRerun(iframe, mapviewer, splitTimes);
    course.splitTimes = {};

    Object.keys(splitTimes).forEach(
      (key) => (course.splitTimes[key] = splitTimes[key])
    );

    delete course.splitTimes.splitsXmlDoc;
  }
</script>

{#if isLoadSplitsDialogOpen}
  <Dialog on:closeDialog={() => (isLoadSplitsDialogOpen = false)}>
    <h3 slot="title">Load split times</h3>

    <LoadSplitTimes
      slot="content"
      bind:savedSplitTimes={splitTimes}
      on:close={handleSplitDialogSubmit}
      {mapviewer}
    />
  </Dialog>
{/if}

<!-- {#if isSplitsTableDialogOpen}
  <Dialog on:closeDialog={() => (isSplitsTableDialogOpen = false)}>
    <h1 slot="title">Split times</h1>

    <SplitTimesTable slot="content" {splitTimes} />
  </Dialog>
{/if} -->

<main class="course-container">
  {#if showSidePanel}
    <aside>
      <details class="options">
        <summary class="icon-button"><span><Gear />Options</span></summary>
        <ul>
          <li>
            <input
              bind:this={loadCourseAndRoutechoicesFromJsonInput}
              on:change={loadCourseAndRoutechoicesFromJson}
              type="file"
              style="display: none;"
            />

            <button
              on:click={() => loadCourseAndRoutechoicesFromJsonInput.click()}
              >Load course routechoices from json</button
            >
          </li>

          <li>
            <button on:click={handleLoadSplitsClick}>Load split times</button>
          </li>

          <li>
            <button on:click={togle2dRerunPanel}>Toggle 2D Rerun</button>
          </li>

          {#if $userStore !== null}
            <li>
              <button on:click={saveToServer} aria-busy={loadingSaveToServer}
                >Save course, routechoices and splitTimes to server</button
              >
            </li>
          {/if}

          <!-- <li>
            <button on:click={() => (isSplitsTableDialogOpen = true)}
              >Split times table</button
            >
          </li> -->
        </ul>
      </details>

      <Toggle
        bind:isFirstValueSelected={isInSplitMode}
        firstLabel={"Splits"}
        secondLabel={"Graph"}
      />

      {#if !isInSplitMode}
        <section class="routechoices-graph">
          <Statistics {legNumber} {splitTimes} />
        </section>
      {/if}

      {#if isInSplitMode}
        <section class="leg-split-times-table-container">
          <LegSplitTimesTable {legNumber} {splitTimes} />
        </section>
      {/if}
    </aside>
  {/if}

  <iframe
    on:load={iframeLoaded}
    bind:this={iframe}
    title="2d-rerun"
    src="2d-rerun/2d-rerun.html"
  />

  <div class="control-bar">
    <button class="mobile" disabled>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
        ><path
          d="M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"
        /></svg
      >
    </button>

    <LegSelector
      bind:selectedLeg={legNumber}
      numberOfLegs={numberOfContols}
      on:legChange={propagateLegChangeTo2DRerun}
    />

    <button class="mobile" on:click={() => (showSidePanel = !showSidePanel)}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
        ><path
          d="M64 400C64 408.8 71.16 416 80 416H480C497.7 416 512 430.3 512 448C512 465.7 497.7 480 480 480H80C35.82 480 0 444.2 0 400V64C0 46.33 14.33 32 32 32C49.67 32 64 46.33 64 64V400zM342.6 278.6C330.1 291.1 309.9 291.1 297.4 278.6L240 221.3L150.6 310.6C138.1 323.1 117.9 323.1 105.4 310.6C92.88 298.1 92.88 277.9 105.4 265.4L217.4 153.4C229.9 140.9 250.1 140.9 262.6 153.4L320 210.7L425.4 105.4C437.9 92.88 458.1 92.88 470.6 105.4C483.1 117.9 483.1 138.1 470.6 150.6L342.6 278.6z"
        /></svg
      >
    </button>
  </div>
</main>

<style>
  main {
    display: flex;
    min-height: 0;
    height: 100%;
    margin: 0;
    padding: 0;
    position: relative;
  }

  aside {
    flex: 0 1 auto;
    display: flex;
    flex-direction: column;
    width: 25rem;
    padding: 1rem;
    border-right: 1px solid lightgray;
    background-color: white;
  }

  .icon-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .icon-button span {
    display: flex;
    align-items: center;
  }

  ul li button {
    background-color: transparent;
    color: rgb(65, 84, 98);
    border: none;
    text-align: left;
    padding: 0;
  }

  ul li button:focus {
    box-shadow: none;
  }

  details ul li button {
    margin: 0 0 0 2rem;
  }

  .leg-split-times-table-container {
    flex: 1 1 auto;
    overflow-y: auto;
    margin: 0;
  }

  .routechoices-graph {
    overflow-y: auto;
    margin-bottom: 0;
  }

  iframe {
    flex: 1 1 auto;
    display: block;
    border: none;
  }

  .control-bar {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .control-bar button {
    width: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .control-bar button svg {
    height: 1.25rem;
  }

  @media screen and (min-width: 500px) {
    .mobile,
    .control-bar .mobile {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    .options {
      display: none;
    }

    aside {
      position: absolute;
      width: 100%;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      padding-bottom: 5rem;
    }
  }
</style>
