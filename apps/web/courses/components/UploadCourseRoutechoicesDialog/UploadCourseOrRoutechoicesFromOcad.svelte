<script lang="ts">
  import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { serializeNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import parseIOFXML3CourseOCADExport from "../../../shared/o-utils/ocad/parsers/iof-xml-3-course";
  import parseGPXRoutechoicesOCADExport from "../../../shared/o-utils/ocad/parsers/routechoices-gpx";
  import mapCourseAndRoutechoicesTo2DRerun from "../../../shared/o-utils/two-d-rerun/course-mappers";
  import courseData from "../../stores/course-data";
  import selectedLeg from "../../stores/selected-leg";
  import buildCourseAndRoutechoices from "../../utils/2d-rerun-hacks/build-course-and-routechoices";

  export let isDialogOpen = false;

  const db = getFirestore();

  let courseXmlDoc: XMLDocument | null = null;
  let routechoicesXmlDoc: XMLDocument | null = null;
  let classNames: string[] = [];
  let classIndex: number | null = null;
  let isCourseFileInvalid = false;
  let isRoutechoicesFileInvalid = false;
  let loading = false;

  const dispatch = createEventDispatcher();

  function loadCourseFromOCAD(event: Event): void {
    const target = event.target as HTMLInputElement;

    if (target === null || target.files?.length !== 1) return;

    const xmlFile = target.files[0];

    if (xmlFile.type !== "text/xml") {
      isCourseFileInvalid = true;
      return;
    }

    isCourseFileInvalid = false;

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target === null) return;
      const readXml = e.target.result;
      if (readXml === null) return;
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

  function loadRoutechoicesFromOcad(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target === null || target.files?.length !== 1) return;

    const xmlFile = target.files[0];

    if (xmlFile.name.split(".").pop() !== "gpx") {
      isRoutechoicesFileInvalid = true;
      return;
    }

    isRoutechoicesFileInvalid = false;
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target === null) return;
      const readXml = e.target.result;
      if (readXml === null) return;
      const parser = new DOMParser();

      routechoicesXmlDoc = parser.parseFromString(
        readXml.toString(),
        "application/xml"
      );
    };

    reader.readAsText(xmlFile);
  }

  async function parseXmlFiles() {
    if (courseXmlDoc === null) {
      alert("You have to upload at least a course.");
      return;
    }

    if (classIndex === null) {
      alert("You have to choose a class.");
      return;
    }

    const [controls, legsWithoutRoutechoices] = parseIOFXML3CourseOCADExport(
      courseXmlDoc,
      classIndex
    );

    $courseData.course = controls;

    if (routechoicesXmlDoc === null) {
      $courseData.legs = legsWithoutRoutechoices;
    } else {
      const legs = parseGPXRoutechoicesOCADExport(
        routechoicesXmlDoc,
        legsWithoutRoutechoices
      );

      $courseData.legs = legs;
    }

    loading = true;

    try {
      await updateDoc(doc(db, "coursesData", $courseData.id), {
        legs: serializeNestedArraysInLegs($courseData.legs),
        course: $courseData.course,
      });
    } catch (error) {
      alert("An error occured while saving the course.");
      console.error(error);
    } finally {
      loading = false;
    }

    if ($courseData.map === null) {
      isDialogOpen = false;

      alert(
        "Course and routechoices uploaded, you will be able to see it when the event will be started."
      );

      return;
    }

    const twoDRerunCourseAndRoutechoices = mapCourseAndRoutechoicesTo2DRerun(
      $courseData.legs,
      $courseData.course,
      $courseData.map.calibration
    );

    buildCourseAndRoutechoices(twoDRerunCourseAndRoutechoices);
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

    <button aria-busy={loading} disabled={loading} type="submit">Upload</button>
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
