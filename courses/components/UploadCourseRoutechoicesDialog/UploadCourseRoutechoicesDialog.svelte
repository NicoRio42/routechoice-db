<script>
  import { fade } from "svelte/transition";

  import course from "../../stores/course";
  import selectedLeg from "../../stores/selected-leg";
  import buildCourseAndRoutechoices from "../../utils/2d-rerun-hacks/build-course-and-routechoices";
  import UploadCourseOrRoutechoicesFromOcad from "./UploadCourseOrRoutechoicesFromOcad.svelte";

  export let isDialogOpen;

  let loadCourseAndRoutechoicesFromJsonInput;

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
  <article>
    {#if step === 1}
      <header>
        <h2>Upload course and routechoices</h2>
      </header>

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

        Upload from OCAD exports
      </article>

      <article class="upload-option" on:click={() => (step = 2)}>
        Upload from 2DRerun export
      </article>

      <footer>
        <button on:click={() => (isDialogOpen = false)}>Cancel</button>
      </footer>
    {/if}

    {#if step === 2}
      <UploadCourseOrRoutechoicesFromOcad bind:isDialogOpen />
    {/if}
  </article>
</dialog>

<style>
  h2 {
    margin: 0;
  }

  .upload-option {
    cursor: pointer;
  }
</style>
