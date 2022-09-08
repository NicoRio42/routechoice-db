<script>
  import iofXmlCourseExportTo2dRerunJson from "../../utils/ocad-xml-parser/ocad-xml-course-parser";
  import gpxRoutechoicesExportTo2DRerunJson from "../../utils/ocad-xml-parser/ocad-gpx-routechoices-parser";
  import buildCourseAndRoutechoices from "../../utils/2d-rerun-hacks/build-course-and-routechoices";
  import course from "../../stores/course";
  import selectedLeg from "../../stores/selected-leg";
  import attributeRoutechoicesToLegs from "../../utils/routechoices-detector/attribute-routechoices-to-legs";
  import addNiceColorsAndNamesToAttributedRoutechoices from "../../utils/routechoices-detector/add-nice-colors-and-names-to-routechoices";
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let isDialogOpen;

  let courseXmlDoc;
  let routechoicesXmlDoc;
  let classNames = [];
  let classIndex;
  let isCourseFileInvalid;
  let isRoutechoicesFileInvalid;

  const dispatch = createEventDispatcher();

  function loadCourseFromOCAD(event) {
    if (event.target.files.length !== 1) {
      return;
    }

    const xmlFile = event.target.files[0];

    if (xmlFile.type !== "text/xml") {
      isCourseFileInvalid = true;
      return;
    }

    isCourseFileInvalid = false;

    const reader = new FileReader();

    reader.onload = (e) => {
      const readXml = e.target.result;
      const parser = new DOMParser();

      courseXmlDoc = parser.parseFromString(
        readXml.toString(),
        "application/xml"
      );

      classNames = Array.from(courseXmlDoc.querySelectorAll("Course Name")).map(
        (cl) => cl.innerHTML
      );

      if (classNames.length > 0) classIndex = 0;
    };

    reader.readAsText(xmlFile);
  }

  function loadRoutechoicesFromOcad(event) {
    if (event.target.files.length === 0) {
      return;
    }

    const xmlFile = event.target.files[0];

    if (xmlFile.name.split(".").pop() !== "gpx") {
      isRoutechoicesFileInvalid = true;
      return;
    }

    isRoutechoicesFileInvalid = false;

    const reader = new FileReader();

    reader.onload = (e) => {
      const readXml = e.target.result;
      const parser = new DOMParser();

      routechoicesXmlDoc = parser.parseFromString(
        readXml.toString(),
        "application/xml"
      );
    };

    reader.readAsText(xmlFile);
  }

  function parseXmlFiles() {
    if (courseXmlDoc === undefined) {
      alert("You have to upload at least a course.");
      return;
    }

    if (classIndex === undefined) {
      alert("You have to choose a class.");
    }

    const coursecoords = iofXmlCourseExportTo2dRerunJson(
      courseXmlDoc,
      classIndex
    );

    const tags =
      routechoicesXmlDoc !== undefined
        ? gpxRoutechoicesExportTo2DRerunJson(routechoicesXmlDoc)
        : [];

    const data = attributeRoutechoicesToLegs({ coursecoords, tags });
    data.tags = addNiceColorsAndNamesToAttributedRoutechoices(data.tags);

    buildCourseAndRoutechoices(data);
    $course.courseAndRoutechoices = data;
    $selectedLeg = 1;
    isDialogOpen = false;
  }
</script>

<form
  on:submit|preventDefault={parseXmlFiles}
  transition:fade={{ duration: 200 }}
>
  <label for="course-file-input">
    Course file (IOF XML 3.0)

    <input
      on:change={loadCourseFromOCAD}
      id="course-file-input"
      name="course-file-input"
      type="file"
      accept="application/xml"
    />

    {#if isCourseFileInvalid}
      <p class="error-message">Invalid file extension</p>
    {/if}
  </label>

  <label for="class-select">
    Class

    <select
      bind:value={classIndex}
      name="class-select"
      id="class-select"
      disabled={classNames.length === 0}
    >
      {#each classNames as clsName, index}
        <option value={index}>{clsName}</option>
      {/each}
    </select>
  </label>

  <label for="routechoices-file-input">
    Routechoices (GPX export)

    <input
      on:change={loadRoutechoicesFromOcad}
      id="routechoices-file-input"
      name="routechoices-file-input"
      type="file"
      accept=".gpx"
    />

    {#if isRoutechoicesFileInvalid}
      <p class="error-message">Invalid file extension</p>
    {/if}
  </label>

  <footer class="button-wrapper">
    <button class="outline" type="button" on:click={() => dispatch("previous")}
      >Cancel</button
    >

    <button type="submit">Upload</button>
  </footer>
</form>

<style>
  .button-wrapper {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .error-message {
    color: rgba(198, 40, 40, 0.999);
    font-size: smaller;
    margin-top: calc(var(--spacing) * -1);
  }
</style>
