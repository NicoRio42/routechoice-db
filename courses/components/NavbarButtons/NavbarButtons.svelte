<script lang="ts">
  import Upload from "../../../shared/icons/Upload.svelte";
  import courseData from "../../stores/course-data";
  import AddRoutechoiceButton from "./AddRoutechoiceButton.svelte";

  let isLoadSplitsDialogOpen = false;
  let isUploadCourseRoutechoicesDialogOpen = false;
  let twoDRerunPanel: HTMLElement;

  let lazySplitTimesDialog: Promise<
    typeof import("../LoadSplitTimes/LoadSplitTimesDialog.svelte")
  >;

  let lazyCourseRoutechoicesDialog: Promise<
    typeof import("../UploadCourseRoutechoicesDialog/UploadCourseRoutechoicesDialog.svelte")
  >;

  let uploadsDropdown: HTMLDetailsElement;

  function handleLoadCourseRoutechoicesClick() {
    lazyCourseRoutechoicesDialog = import(
      "../UploadCourseRoutechoicesDialog/UploadCourseRoutechoicesDialog.svelte"
    );

    isUploadCourseRoutechoicesDialogOpen = true;

    lazyCourseRoutechoicesDialog.then(() =>
      uploadsDropdown.removeAttribute("open")
    );
  }

  function handleLoadSplitsClick() {
    if (!$courseData?.legs.length === undefined) {
      alert("You sould import a course first.");
      return;
    }

    lazySplitTimesDialog = import(
      "../LoadSplitTimes/LoadSplitTimesDialog.svelte"
    );
    isLoadSplitsDialogOpen = true;

    lazySplitTimesDialog.then(() => uploadsDropdown.removeAttribute("open"));
  }

  function toggle2DRerunPanel() {
    if (twoDRerunPanel === undefined) {
      const panel = document.getElementById("rightmenu");
      if (panel === null) return;
      twoDRerunPanel = panel;
    }

    twoDRerunPanel.style.display =
      twoDRerunPanel.style.display === "none" ? "block" : "none";
  }
</script>

{#if isLoadSplitsDialogOpen && lazySplitTimesDialog}
  {#await lazySplitTimesDialog then { default: LoadSplitTimesDialog }}
    <LoadSplitTimesDialog bind:isDialogOpen={isLoadSplitsDialogOpen} />
  {/await}
{/if}

{#if isUploadCourseRoutechoicesDialogOpen && lazyCourseRoutechoicesDialog}
  {#await lazyCourseRoutechoicesDialog then { default: UploadCourseRoutechoicesDialog }}
    <UploadCourseRoutechoicesDialog
      bind:isDialogOpen={isUploadCourseRoutechoicesDialogOpen}
    />
  {/await}
{/if}

<li class="menu-list-item large-devices">
  <details role="list" bind:this={uploadsDropdown}>
    <summary aria-haspopup="listbox">
      <Upload />
      Upload
    </summary>
    <ul>
      <li class="option-item">
        <button on:click={handleLoadCourseRoutechoicesClick}
          >Course and routechoices</button
        >
      </li>

      <li class="option-item">
        <button on:click={handleLoadSplitsClick}>Load split times</button>
      </li>
    </ul>
  </details>
</li>

<li class="menu-list-item large-devices">
  <button class="toggle-2d-rerun-button outline" on:click={toggle2DRerunPanel}
    >Toggle 2D Rerun panel</button
  >
</li>

<li class="menu-list-item large-devices">
  <AddRoutechoiceButton />
</li>

<style>
  .menu-list-item {
    margin-left: 2rem;
    padding: 0;
  }

  summary {
    display: flex;
    align-items: center;
  }

  .option-item button {
    border: none;
    background-color: transparent;
    color: var(--dropdown-color);
    text-align: left;
    padding: 0;
  }

  .option-item button:focus {
    box-shadow: none;
  }

  .option-item:hover {
    background-color: lightgray;
  }

  .toggle-2d-rerun-button {
    height: auto;
    padding: var(--nav-link-spacing-vertical) var(--nav-link-spacing-horizontal);
  }

  @media only screen and (max-width: 600px) {
    .large-devices {
      display: none;
    }
  }
</style>
