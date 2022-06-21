<script>
  import userStore from "../../shared/stores/user-store";
  import course from "../stores/course";
  import { doc, getFirestore, setDoc } from "firebase/firestore/lite";
  import selectedLeg from "../stores/selected-leg";
  import buildCourseAndRoutechoices from "../utils/2d-rerun-hacks/build-course-and-routechoices";
  import LoadSplitTimesDialog from "./LoadSplitTimesDialog.svelte";
  import Upload from "../../shared/icons/Upload.svelte";
  import UploadCourseRoutechoicesDialog from "./UploadCourseRoutechoicesDialog/UploadCourseRoutechoicesDialog.svelte";

  let isLoadSplitsDialogOpen = false;
  let loadingSaveToServer = false;
  let isOptionDropdownOpen = false;
  let isUploadCourseRoutechoicesDialogOpen = false;

  const db = getFirestore();

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
    isOptionDropdownOpen = false;
  }

  async function saveToServer() {
    if ($course === undefined) {
      alert("Nothing to save");
      return;
    }

    if (!confirm("Are you sure you want to save to server ?")) {
      return;
    }

    loadingSaveToServer = true;

    const courseToSave = { ...$course };
    const id = courseToSave.id;
    delete courseToSave.id;
    await setDoc(doc(db, "courses", id), courseToSave);
    loadingSaveToServer = false;
    isOptionDropdownOpen = false;
  }

  function handleLoadSplitsClick() {
    if (!$course?.courseAndRoutechoices?.coursecoords.length) {
      alert("You sould draw a course first.");
      return;
    }

    isLoadSplitsDialogOpen = true;
    isOptionDropdownOpen = false;
  }
</script>

{#if isLoadSplitsDialogOpen}
  <LoadSplitTimesDialog bind:isDialogOpen={isLoadSplitsDialogOpen} />
{/if}

{#if isUploadCourseRoutechoicesDialogOpen}
  <UploadCourseRoutechoicesDialog
    bind:isDialogOpen={isUploadCourseRoutechoicesDialogOpen}
  />
{/if}

<li class="menu-list-item large-devices">
  <details role="list" open={isOptionDropdownOpen}>
    <summary aria-haspopup="listbox">
      <Upload />
      Upload
    </summary>
    <ul>
      <li class="option-item">
        <button on:click={() => (isUploadCourseRoutechoicesDialogOpen = true)}
          >Course and routechoices</button
        >
      </li>

      <li class="option-item">
        <button on:click={handleLoadSplitsClick}>Load split times</button>
      </li>
    </ul>
  </details>
</li>

{#if $userStore !== null}
  <li class="menu-list-item large-devices">
    <button
      on:click={saveToServer}
      aria-busy={loadingSaveToServer}
      class="outline save-button">Save</button
    >
  </li>
{/if}

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

  .save-button {
    height: auto;
    padding: var(--nav-link-spacing-vertical) var(--nav-link-spacing-horizontal);
  }

  @media only screen and (max-width: 600px) {
    .large-devices {
      display: none;
    }
  }
</style>
