<script lang="ts">
  import Dialog from "../components/Dialog.svelte";
  import LegSelector from "../components/LegSelector.svelte";
  import LoadSplitTimes from "../components/LoadSplitTimes.svelte";
  import LegSplitTimesTable from "../components/SplitTimesTable/LegSplitTimesTable.svelte";
  import SplitTimesTable from "../components/SplitTimesTable/SplitTimesTable.svelte";
  import Statistics from "../components/Statistics.svelte";
  import Toggle from "../components/Toggle.svelte";
  import { selectHack } from "../utils/2d-rerun-hacks/display";
  import { IOFXMLParser } from "../utils/iof-xml-parser/IOFXMLParser";
  import { detectRunnersRoutechoices } from "../utils/routechoices-detector/detect-route";

  let isLoadSplitsDialogOpen = false;
  let isSplitsTableDialogOpen = false;
  let isInSplitMode = true;
  let splitTimes: IOFXMLParser = { runners: [], routeChoicesStatistics: [] };
  let legNumber = 1;
  let iframe: HTMLElement;
  let numberOfContols: number;
  let mapviewer;
  let showSidePanel = true;

  const iframeLoaded = () => {
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

  const propagateLegChangeTo2DRerun = () => {
    selectHack(iframe, "selectmode", "analyzecourse");
    iframe.contentDocument.getElementById(`ac-${legNumber}`).click();
  };

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
      on:close={() => (isLoadSplitsDialogOpen = false)}
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
      <nav>
        <ul>
          <li>
            <details>
              <summary class="icon-button"
                ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                  ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                    d="M105.4 182.6c12.5 12.49 32.76 12.5 45.25 .001L224 109.3V352c0 17.67 14.33 32 32 32c17.67 0 32-14.33 32-32V109.3l73.38 73.38c12.49 12.49 32.75 12.49 45.25-.001c12.49-12.49 12.49-32.75 0-45.25l-128-128C272.4 3.125 264.2 0 256 0S239.6 3.125 233.4 9.375L105.4 137.4C92.88 149.9 92.88 170.1 105.4 182.6zM480 352h-160c0 35.35-28.65 64-64 64s-64-28.65-64-64H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h448c17.67 0 32-14.33 32-32v-96C512 366.3 497.7 352 480 352zM432 456c-13.2 0-24-10.8-24-24c0-13.2 10.8-24 24-24s24 10.8 24 24C456 445.2 445.2 456 432 456z"
                  /></svg
                >Uploads &nbsp;
              </summary>

              <ul>
                <li><button>Course</button></li>

                <li><button>Routechoices</button></li>

                <li>
                  <button on:click={() => (isLoadSplitsDialogOpen = true)}
                    >Split times</button
                  >
                </li>
              </ul>
            </details>
          </li>

          <li>
            <button class="icon-button" on:click={detectRoutechoices}
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                  d="M320 256C302.3 256 288 270.3 288 288C288 305.7 302.3 320 320 320H416C469 320 512 362.1 512 416C512 469 469 512 416 512H139.6C148.3 502.1 158.9 489.4 169.6 475.2C175.9 466.8 182.4 457.6 188.6 448H416C433.7 448 448 433.7 448 416C448 398.3 433.7 384 416 384H320C266.1 384 223.1 341 223.1 288C223.1 234.1 266.1 192 320 192H362.1C340.2 161.5 320 125.4 320 96C320 42.98 362.1 0 416 0C469 0 512 42.98 512 96C512 160 416 256 416 256H320zM416 128C433.7 128 448 113.7 448 96C448 78.33 433.7 64 416 64C398.3 64 384 78.33 384 96C384 113.7 398.3 128 416 128zM118.3 487.8C118.1 488 117.9 488.2 117.7 488.4C113.4 493.4 109.5 497.7 106.3 501.2C105.9 501.6 105.5 502 105.2 502.4C99.5 508.5 96 512 96 512C96 512 0 416 0 352C0 298.1 42.98 255.1 96 255.1C149 255.1 192 298.1 192 352C192 381.4 171.8 417.5 149.9 448C138.1 463.2 127.7 476.9 118.3 487.8L118.3 487.8zM95.1 384C113.7 384 127.1 369.7 127.1 352C127.1 334.3 113.7 320 95.1 320C78.33 320 63.1 334.3 63.1 352C63.1 369.7 78.33 384 95.1 384z"
                /></svg
              >Detect routechoices</button
            >
          </li>

          <li>
            <button class="icon-button" on:click={togle2dRerunPanel}
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
                ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                  d="M192 352C138.1 352 96 309 96 256C96 202.1 138.1 160 192 160C245 160 288 202.1 288 256C288 309 245 352 192 352zM384 448H192C85.96 448 0 362 0 256C0 149.1 85.96 64 192 64H384C490 64 576 149.1 576 256C576 362 490 448 384 448zM384 128H192C121.3 128 64 185.3 64 256C64 326.7 121.3 384 192 384H384C454.7 384 512 326.7 512 256C512 185.3 454.7 128 384 128z"
                /></svg
              >Toggle 2D Rerun</button
            >
          </li>
        </ul>
      </nav>

      <!-- <button on:click={() => (isSplitsTableDialogOpen = true)}
      >Split times table</button
    > -->

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
    id="2d-rerun"
    title="2d-rerun"
    src="2d-rerun/2d-rerun.html"
  />

  <div class="control-bar">
    <button class="mobile">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
        ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
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
        ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
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

  aside nav {
    margin-bottom: 1rem;
  }

  details {
    border: none;
  }

  .icon-button {
    display: flex;
    align-items: center;
  }

  .icon-button svg {
    height: 1.25rem;
    margin: 0 1rem 0 0;
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
    nav {
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
