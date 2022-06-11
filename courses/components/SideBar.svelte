<script>
  import Gear from "../../shared/icons/Gear.svelte";
  import userStore from "../../shared/stores/user-store";
  import LegSplitTimesTable from "./SplitTimesTable/LegSplitTimesTable.svelte";
  import showSideBar from "../stores/show-sidebar";
  import Statistics from "./Statistics.svelte";
  import Toggle from "./Toggle.svelte";
  import course from "../stores/course";
  import { doc, getFirestore, setDoc } from "firebase/firestore/lite";
  import selectedLeg from "../stores/selected-leg";
  import buildCourseAndRoutechoices from "../utils/2d-rerun-hacks/build-course-and-routechoices";
  import LoadSplitTimesDialog from "./LoadSplitTimesDialog.svelte";

  let isLoadSplitsDialogOpen = false;
  let isInSplitMode = true;
  let loadingSaveToServer = false;
  let loadCourseAndRoutechoicesFromJsonInput;
  let rightmenu;

  const db = getFirestore();

  /**@type {IOFXMLParser}*/
  let splitTimes = { runners: [], routeChoicesStatistics: [] };
  let legNumber = 1;

  const togle2dRerunPanel = () => {
    if (!rightmenu) {
      rightmenu = document.getElementById("rightmenu");
    }

    rightmenu.style.display =
      rightmenu.style.display === "block" ? "none" : "block";
  };

  function propagateLegChangeTo2DRerun() {
    // if (!legNumber) {
    //   return;
    // }
    // selectHack(iframe, "selectmode", "analyzecourse");
    // iframe.contentDocument.getElementById(`ac-${legNumber}`).click();
  }

  const detectRoutechoices = () => {
    // splitTimes.runners = detectRunnersRoutechoices(
    //   splitTimes.runners,
    //   mapviewer,
    //   mapviewer.routes
    // );
  };

  function loadCourseAndRoutechoicesFromJson(event) {
    let reader = new FileReader();
    reader.onload = function (e) {
      if (typeof e.target.result !== "string") {
        return;
      }

      const data = JSON.parse(e.target.result);
      buildCourseAndRoutechoices(data);
      $course.courseAndRoutechoices = data;
      $selectedLeg = 1;
    };
    reader.readAsText(event.target.files[0]);
  }

  async function saveToServer() {
    if ($course === undefined) {
      alert("Nothing to save");
      return;
    }
    loadingSaveToServer = true;
    await setDoc(doc(db, "courses", $course.id), $course);
    loadingSaveToServer = false;
  }

  function handleLoadSplitsClick() {
    // if (numberOfContols === undefined) {
    //   alert("You sould draw a course first.");
    //   return;
    // }
    // isLoadSplitsDialogOpen = true;
  }

  function handleSplitDialogSubmit() {
    // isLoadSplitsDialogOpen = false;
    // detectRoutechoices();
    // splitTimes.computeRoutechoicesStatistics();
    // loadSplitsTo2dRerun(iframe, mapviewer, splitTimes);
    // course.splitTimes = {};
    // Object.keys(splitTimes).forEach(
    //   (key) => (course.splitTimes[key] = splitTimes[key])
    // );
    // delete course.splitTimes.splitsXmlDoc;
  }
</script>

{#if isLoadSplitsDialogOpen}
  <LoadSplitTimesDialog bind:isDialogOpen={isLoadSplitsDialogOpen} />
{/if}

<!-- {#if isSplitsTableDialogOpen}
    <Dialog on:closeDialog={() => (isSplitsTableDialogOpen = false)}>
      <h1 slot="title">Split times</h1>
  
      <SplitTimesTable slot="content" {splitTimes} />
    </Dialog>
  {/if} -->

{#if $showSideBar}
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
        <LegSplitTimesTable />
      </section>
    {/if}
  </aside>
{/if}

<style>
  aside {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    padding: 4.375rem 1rem 1rem;
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
  details ul {
    max-width: fit-content;
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

  @media screen and (max-width: 500px) {
    .options {
      display: none;
    }

    aside {
      width: 100%;
      right: 0;
      padding-bottom: 5rem;
    }
  }
</style>
