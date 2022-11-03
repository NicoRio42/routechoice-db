<script lang="ts">
  import { fade } from "svelte/transition";
  import clickOutside from "../../../shared/use/clickOutside";

  import course from "../../stores/course-data";
  import selectedLeg from "../../stores/selected-leg";
  import buildCourseAndRoutechoices from "../../utils/2d-rerun-hacks/build-course-and-routechoices";
  import UploadCourseOrRoutechoicesFromOcad from "./UploadCourseOrRoutechoicesFromOcad.svelte";

  export let isDialogOpen = false;

  let loadCourseAndRoutechoicesFromJsonInput: HTMLInputElement;

  let step = 1;

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
            on:change={loadCourseAndRoutechoicesFromJson}
            type="file"
            style="display: none;"
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
