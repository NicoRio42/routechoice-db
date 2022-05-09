<script>
  import Dialog from "../components/Dialog.svelte";
  import LegSelector from "../components/LegSelector.svelte";
  import LoadSplitTimes from "../components/LoadSplitTimes.svelte";
  import LegSplitTimesTable from "../components/SplitTimesTable/LegSplitTimesTable.svelte";
  import SplitTimesTable from "../components/SplitTimesTable/SplitTimesTable.svelte";
  import Statistics from "../components/Statistics.svelte";
  import Toggle from "../components/Toggle.svelte";
  import { getMapviewer } from "../utils/2d-rerun-hacks/get-mapviewer";
  import { initMapviewer } from "../utils/2d-rerun-hacks/init-mapviewer";
  import { loadSplitsTo2dRerun } from "../utils/2d-rerun-hacks/load-splits-to-2d-rerun";
  import { selectHack } from "../utils/2d-rerun-hacks/select-hack";
  import { IOFXMLParser } from "../utils/iof-xml-parser/IOFXMLParser";
  import { detectRunnersRoutechoices } from "../utils/routechoices-detector/detect-route";

  export let logatorUrl = "https://events.loggator.com/muaoUA";

  let isLoadSplitsDialogOpen = false;
  let isSplitsTableDialogOpen = false;
  let isInSplitMode = true;

  /**@type {IOFXMLParser}*/
  let splitTimes = { runners: [], routeChoicesStatistics: [] };
  let legNumber = 1;

  /**@type {number}*/
  let numberOfContols;

  /**@type {HTMLIFrameElement}*/
  let iframe;

  /**@type {import("../models/mapviewer").Mapviewer}*/
  let mapviewer;
  let showSidePanel = true;

  function iframeLoaded() {
    mapviewer = getMapviewer(iframe);

    initMapviewer(mapviewer, iframe, logatorUrl).then((data) => {
      numberOfContols = data.coursecoords.length - 1;
      setTimeout(propagateLegChangeTo2DRerun, 3000);
    });
  }

  const togle2dRerunPanel = () => {
    if (iframe) {
      let rightmenu = iframe.contentDocument.getElementById("rightmenu");
      rightmenu.style.display =
        rightmenu.style.display === "block" ? "none" : "block";
    }
  };

  function propagateLegChangeTo2DRerun() {
    selectHack(iframe, "selectmode", "analyzecourse");
    iframe.contentDocument.getElementById(`ac-${legNumber}`).click();
  }

  const detectRoutechoices = () => {
    splitTimes.runners = detectRunnersRoutechoices(
      splitTimes.runners,
      mapviewer,
      mapviewer.routes
    );

    splitTimes.computeRoutechoicesStatistics();
  };
</script>

{#if isLoadSplitsDialogOpen}
  <Dialog on:closeDialog={() => (isLoadSplitsDialogOpen = false)}>
    <h3 slot="title">Load split times</h3>

    <LoadSplitTimes
      slot="content"
      bind:savedSplitTimes={splitTimes}
      on:close={() => {
        isLoadSplitsDialogOpen = false;
        detectRoutechoices();
        loadSplitsTo2dRerun(iframe, mapviewer, splitTimes);
      }}
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

<main class="course-container">
  {#if showSidePanel}
    <aside>
      <details class="options">
        <summary class="icon-button"
          ><span
            ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
              ><path
                d="M495.9 166.6C499.2 175.2 496.4 184.9 489.6 191.2L446.3 230.6C447.4 238.9 448 247.4 448 256C448 264.6 447.4 273.1 446.3 281.4L489.6 320.8C496.4 327.1 499.2 336.8 495.9 345.4C491.5 357.3 486.2 368.8 480.2 379.7L475.5 387.8C468.9 398.8 461.5 409.2 453.4 419.1C447.4 426.2 437.7 428.7 428.9 425.9L373.2 408.1C359.8 418.4 344.1 427 329.2 433.6L316.7 490.7C314.7 499.7 307.7 506.1 298.5 508.5C284.7 510.8 270.5 512 255.1 512C241.5 512 227.3 510.8 213.5 508.5C204.3 506.1 197.3 499.7 195.3 490.7L182.8 433.6C167 427 152.2 418.4 138.8 408.1L83.14 425.9C74.3 428.7 64.55 426.2 58.63 419.1C50.52 409.2 43.12 398.8 36.52 387.8L31.84 379.7C25.77 368.8 20.49 357.3 16.06 345.4C12.82 336.8 15.55 327.1 22.41 320.8L65.67 281.4C64.57 273.1 64 264.6 64 256C64 247.4 64.57 238.9 65.67 230.6L22.41 191.2C15.55 184.9 12.82 175.3 16.06 166.6C20.49 154.7 25.78 143.2 31.84 132.3L36.51 124.2C43.12 113.2 50.52 102.8 58.63 92.95C64.55 85.8 74.3 83.32 83.14 86.14L138.8 103.9C152.2 93.56 167 84.96 182.8 78.43L195.3 21.33C197.3 12.25 204.3 5.04 213.5 3.51C227.3 1.201 241.5 0 256 0C270.5 0 284.7 1.201 298.5 3.51C307.7 5.04 314.7 12.25 316.7 21.33L329.2 78.43C344.1 84.96 359.8 93.56 373.2 103.9L428.9 86.14C437.7 83.32 447.4 85.8 453.4 92.95C461.5 102.8 468.9 113.2 475.5 124.2L480.2 132.3C486.2 143.2 491.5 154.7 495.9 166.6V166.6zM256 336C300.2 336 336 300.2 336 255.1C336 211.8 300.2 175.1 256 175.1C211.8 175.1 176 211.8 176 255.1C176 300.2 211.8 336 256 336z"
              /></svg
            >Options</span
          ></summary
        >
        <ul>
          <li><button>Load course</button></li>

          <li><button>Load routechoices</button></li>

          <li>
            <button on:click={() => (isLoadSplitsDialogOpen = true)}
              >Load split times</button
            >
          </li>

          <li>
            <button on:click={togle2dRerunPanel}>Toggle 2D Rerun</button>
          </li>

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
    <button class="mobile">
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

  .icon-button svg {
    height: 1.25rem;
    margin: 0 0.5rem 0 0;
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
