<script lang="ts">
  import Dialog from "../components/Dialog.svelte";
  import LoadSplitTimes from "../components/LoadSplitTimes.svelte";
  import LegSplitTimesTable from "../components/SplitTimesTable/LegSplitTimesTable.svelte";
  import SplitTimesTable from "../components/SplitTimesTable/SplitTimesTable.svelte";
  import { selectHack } from "../utils/2d-rerun-hacks/display";
  import { IOFXMLParser } from "../utils/iof-xml-parser/IOFXMLParser";
  import { detectRunnersRoutechoices } from "../utils/routechoices-detector/detect-route";

  let isLoadSplitsDialogOpen = false;
  let isSplitsTableDialogOpen = false;
  let isInSplitMode = true;
  let splitTimes: IOFXMLParser = { runners: [] };
  let legNumber = 1;
  let iframe: HTMLElement;
  let numberOfContols: number;
  let mapviewer;

  const iframeLoaded = (e) => {
    iframe = document.getElementById("2d-rerun");
    iframe.contentWindow.mapviewer.loadseu(
      "http://www.tulospalvelu.fi/gps/",
      "logatec_3LENA"
    );

    fetch("course-tags.json")
      .then((res) => res.json())
      .then((data) => {
        iframe.contentWindow.mapviewer.tags = data.tags;
        iframe.contentWindow.mapviewer.coursecoords = data.coursecoords;
        iframe.contentWindow.mapviewer.otechinfo = data.otechinfo;
        iframe.contentWindow.mapviewer.request_redraw();
        iframe.contentWindow.mapviewer.update_routediv();

        mapviewer = iframe.contentWindow.mapviewer;
        console.log(mapviewer);

        numberOfContols = data.coursecoords.length - 1;

        iframe.contentDocument.getElementById("shown").click();
        selectHack(iframe, "selectmode", "analyzecourse");
        selectHack(iframe, "showtagsselect", "1");
      });
  };

  const togle2dRerunPanel = () => {
    if (iframe) {
      let rightmenu = iframe.contentDocument.getElementById("rightmenu");
      rightmenu.style.display =
        rightmenu.style.display === "block" ? "none" : "block";
    }
  };

  const handlePreviousControl = () => {
    legNumber = legNumber !== 0 ? legNumber - 1 : legNumber;
    propagateLegChangeTo2DRerun();
  };

  const handleNextControl = () => {
    legNumber = legNumber !== numberOfContols ? legNumber + 1 : legNumber;
    propagateLegChangeTo2DRerun();
  };

  const propagateLegChangeTo2DRerun = () => {
    selectHack(iframe, "selectmode", "analyzecourse");
    iframe.contentDocument.getElementById(`ac-${legNumber}`).click();
  };

  const detectRoutechoices = () => {
    splitTimes = {
      ...splitTimes,
      runners: detectRunnersRoutechoices(
        splitTimes.runners,
        mapviewer,
        mapviewer.routes
      ),
    };
  };
</script>

{#if isLoadSplitsDialogOpen}
  <Dialog on:closeDialog={() => (isLoadSplitsDialogOpen = false)}>
    <h1 slot="title">Load split times</h1>

    <LoadSplitTimes
      slot="content"
      bind:savedSplitTimes={splitTimes}
      {mapviewer}
    />
  </Dialog>
{/if}

{#if isSplitsTableDialogOpen}
  <Dialog on:closeDialog={() => (isSplitsTableDialogOpen = false)}>
    <h1 slot="title">Split times</h1>

    <SplitTimesTable slot="content" {splitTimes} />
  </Dialog>
{/if}

<div class="course-container">
  <aside>
    <button on:click={togle2dRerunPanel}>Show 2d-rerun panel</button>

    <button on:click={() => (isLoadSplitsDialogOpen = true)}>Split times</button
    >

    <button on:click={detectRoutechoices}>Detect routechoices</button>

    <button on:click={() => (isSplitsTableDialogOpen = true)}
      >Split times table</button
    >

    <button on:click={() => (isInSplitMode = !isInSplitMode)}
      ><span>Splits</span> / <span>Graph</span></button
    >

    {#if !isInSplitMode}
      <section class="routechoices-graph">
        <p class="graph-item">
          A <span class="bar-group">
            <span
              style:opacity="50%"
              style:background-color="blue"
              style:width="86%"
              class="bar"
            />
            <span style:background-color="blue" style:width="80%" class="bar" />
          </span>
        </p>

        <p class="graph-item">
          B <span class="bar-group">
            <span
              style:opacity="50%"
              style:background-color="yellow"
              style:width="81%"
              class="bar"
            />
            <span
              style:background-color="yellow"
              style:width="70%"
              class="bar"
            />
          </span>
        </p>

        <p class="graph-item">
          C <span class="bar-group">
            <span
              style:opacity="50%"
              style:background-color="green"
              style:width="100%"
              class="bar"
            />
            <span
              style:background-color="green"
              style:width="96%"
              class="bar"
            />
          </span>
        </p>
      </section>
    {/if}

    {#if isInSplitMode}
      <section class="leg-split-times-table-container">
        <LegSplitTimesTable {legNumber} {splitTimes} />
      </section>
    {/if}
  </aside>

  <iframe
    on:load={iframeLoaded}
    id="2d-rerun"
    title="2d-rerun"
    src="2d-rerun/2d-rerun.html"
  />
</div>

<div class="pilot">
  <button on:click={handlePreviousControl}>&#8592;</button>
  <select bind:value={legNumber} on:change={propagateLegChangeTo2DRerun}>
    {#each [...Array(numberOfContols).keys()] as leg}
      <option value={leg + 1}>{leg + 1}</option>
    {/each}
  </select>
  <button on:click={handleNextControl}>&#8594;</button>
</div>

<style>
  .course-container {
    display: flex;
    min-height: 0;
    height: 100%;
  }

  aside {
    flex: 0 1 auto;
    display: flex;
    flex-direction: column;
    width: 20rem;
    background-color: white;
    box-shadow: 3px 3px 5px lightgray;
    padding: 0.5rem;
  }

  .graph-item {
    display: flex;
    align-items: center;
  }

  .bar-group {
    margin-left: 0.5rem;
    position: relative;
    width: 100%;
    height: 0.5rem;
  }

  .bar {
    position: absolute;
    border-radius: 2px;
    height: 100%;
  }

  .leg-split-times-table-container {
    flex: 1 1 auto;
    overflow-y: auto;
  }

  iframe {
    flex: 1 1 auto;
    display: block;
    border: none;
  }

  .pilot {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
    display: flex;
    justify-content: center;
  }
</style>
