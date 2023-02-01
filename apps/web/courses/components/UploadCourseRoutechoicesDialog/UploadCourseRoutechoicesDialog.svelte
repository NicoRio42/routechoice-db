<script lang="ts">
  import { fade } from "svelte/transition";
  import { parseTwoDRerunCourseAndRoutechoicesExport } from "../../../shared/o-utils/two-d-rerun/course-mappers";
  import clickOutside from "../../../shared/use/clickOutside";
  import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
  import { CoordinatesConverter } from "../../../shared/o-utils/map/coords-converter";
  import { serializeNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import courseData from "../../stores/course-data";
  import selectedLeg from "../../stores/selected-leg";
  import buildCourseAndRoutechoices from "../../utils/2d-rerun-hacks/build-course-and-routechoices";
  import UploadCourseOrRoutechoicesFromOcad from "./UploadCourseOrRoutechoicesFromOcad.svelte";

  const db = getFirestore();

  export let isDialogOpen = false;

  let loadCourseAndRoutechoicesFromJsonInput: HTMLInputElement;

  let step = 1;

  interface FormEventHandler<T> {
    currentTarget: T;
  }

  function loadCourseAndRoutechoicesFromJson(
    event: FormEventHandler<HTMLInputElement>
  ) {
    let reader = new FileReader();

    reader.onload = async function (e: ProgressEvent<FileReader>) {
      if (e.target === null) return;
      const data = e.target.result;
      if (typeof data !== "string") return;

      const twoDRerunCourseAndRoutechoices = JSON.parse(data);

      if ($courseData.map === null)
        throw new Error(
          "No map callibration, event migth not have started yet."
        );

      const coordinatesConverter = new CoordinatesConverter(
        $courseData.map.calibration
      );

      const [controls, legs] = parseTwoDRerunCourseAndRoutechoicesExport(
        twoDRerunCourseAndRoutechoices,
        coordinatesConverter
      );

      $courseData.legs = legs;
      $courseData.course = controls;

      await updateDoc(doc(db, "coursesData", $courseData.id), {
        legs: serializeNestedArraysInLegs($courseData.legs),
        course: $courseData.course,
      });

      buildCourseAndRoutechoices(twoDRerunCourseAndRoutechoices);
      $selectedLeg = 1;
      isDialogOpen = false;
    };

    if (event.currentTarget.files === null) return;
    reader.readAsText(event.currentTarget.files[0]);
  }
</script>

<dialog open transition:fade={{ duration: 200 }}>
  <article use:clickOutside={() => (isDialogOpen = false)}>
    <header>
      <a
        aria-label="Close"
        class="close"
        on:click={() => (isDialogOpen = false)}
      />

      <strong
        >{step === 1
          ? "Upload course and routechoices"
          : "Upload from OCAD exports"}</strong
      >
    </header>

    {#if step === 1}
      <div class="options-wrapper">
        <article
          class="upload-option"
          on:click={() => loadCourseAndRoutechoicesFromJsonInput.click()}
        >
          <input
            bind:this={loadCourseAndRoutechoicesFromJsonInput}
            type="file"
            style="display: none;"
            on:change={loadCourseAndRoutechoicesFromJson}
          />

          Upload from 2DRerun export
        </article>

        <article class="upload-option" on:click={() => (step = 2)}>
          Upload from OCAD exports
        </article>
      </div>

      <footer>
        <button on:click={() => (isDialogOpen = false)}>Cancel</button>
      </footer>
    {/if}

    {#if step === 2}
      <UploadCourseOrRoutechoicesFromOcad
        bind:isDialogOpen
        on:previous={() => (step = 1)}
      />
    {/if}
  </article>
</dialog>

<style>
  .upload-option {
    cursor: pointer;
    margin: 0;
  }

  .options-wrapper {
    display: flex;
    gap: 1rem;
  }
</style>
