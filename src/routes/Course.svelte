<script lang="ts">
  import Dialog from "../components/Dialog.svelte";
  import LoadSplitTimes from "../components/LoadSplitTimes.svelte";
  import LegSplitTimesTable from "../components/SplitTimesTable/LegSplitTimesTable.svelte";
  import SplitTimesTable from "../components/SplitTimesTable/SplitTimesTable.svelte";

  let isLoadSplitsDialogOpen = false;
  let isSplitsTableDialogOpen = false;
  let splitTimes = {
    runners: [],
    course: [],
  };
  let legNumber = 1;
  let iframe: HTMLElement;
  let numberOfContols: number;

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

        numberOfContols = data.tags.length;
      });
  };

  const show2dRerunPanel = () => {
    if (iframe) {
      let rightmenu = iframe.contentDocument.getElementById("rightmenu");
      rightmenu.style.display = "block";
    }
  };

  const handlePreviousControl = () => {
    legNumber = legNumber !== 0 ? legNumber - 1 : legNumber;
    let select = iframe.contentDocument.getElementById("selectmode");
    select.value = "analyzecourse";
    select.dispatchEvent(new Event("change"));
    iframe.contentDocument.getElementById("ac-back").click();
  };

  const handleNextControl = () => {
    legNumber = legNumber !== numberOfContols ? legNumber + 1 : legNumber;
    let select = iframe.contentDocument.getElementById("selectmode");
    select.value = "analyzecourse";
    select.dispatchEvent(new Event("change"));
    iframe.contentDocument.getElementById("ac-forward").click();
  };

  const handlePreviousLeg = () => {
    legNumber = legNumber === 1 ? 1 : legNumber - 1;
  };

  const handleNextLeg = (totalNumberOfLegs) => {
    legNumber = legNumber === totalNumberOfLegs ? legNumber : legNumber + 1;
  };
</script>

{#if isLoadSplitsDialogOpen}
  <Dialog on:closeDialog={() => (isLoadSplitsDialogOpen = false)}>
    <h1 slot="title">Load split times</h1>

    <LoadSplitTimes slot="content" bind:savedSplitTimes={splitTimes} />
  </Dialog>
{/if}

{#if isSplitsTableDialogOpen}
  <Dialog on:closeDialog={() => (isSplitsTableDialogOpen = false)}>
    <h1 slot="title">Split times</h1>

    <SplitTimesTable slot="content" {splitTimes} />
  </Dialog>
{/if}

<div class="container">
  <aside>
    <button on:click={show2dRerunPanel}>Show 2d-rerun panel</button>

    <button on:click={() => (isLoadSplitsDialogOpen = true)}>Split times</button
    >

    <button>Detect routechoices</button>

    <button on:click={() => (isSplitsTableDialogOpen = true)}
      >Split times table</button
    >

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
          <span style:background-color="yellow" style:width="70%" class="bar" />
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
          <span style:background-color="green" style:width="96%" class="bar" />
        </span>
      </p>
    </section>

    <section>
      <div class="leg-split-times-table-container">
        <LegSplitTimesTable {legNumber} {splitTimes} />
      </div>
      <button on:click={() => handlePreviousLeg()}>Previous</button>
      {legNumber}
      <button on:click={() => handleNextLeg(splitTimes.course.length)}
        >Next</button
      >
    </section>
  </aside>

  <iframe
    on:load={iframeLoaded}
    id="2d-rerun"
    title="2d-rerun"
    src="2d-rerun/2d-rerun.html"
  />

  <div class="pilot">
    <button on:click={handlePreviousControl}>Previous</button>
    <select name="" id="">
      <option value="">1</option>
      <option value="">2</option>
      <option value="">3</option>
    </select>
    <button on:click={handleNextControl}>Next</button>
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr auto;
    /* grid-auto-columns: auto; */
  }

  aside {
    grid-column: 1;
    grid-row: 1 / 3;
    width: 20rem;
    background-color: white;
    box-shadow: 3px 3px 5px lightgray;
    padding: 0.5rem;
    overflow-y: scroll;
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

  iframe {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    height: 100%;
    /* flex-grow: 1; */
    display: block;
    border: none;
  }

  .pilot {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    justify-content: center;
  }
</style>
