<script>
  import iofXmlCourseExportTo2dRerunJson from "../../utils/ocad-xml-parser/ocad-xml-course-parser";
  import gpxRoutechoicesExportTo2DRerunJson from "../../utils/ocad-xml-parser/ocad-gpx-routechoices-parser";

  export let isDialogOpen;

  let courseXmlDoc;
  let routechoicesXmlDoc;
  let classNames = [];
  let classIndex;

  function loadCourseFromOCAD(event) {
    if (event.target.files.length === 0) {
      return;
    }

    const xmlFile = event.target.files[0];
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
    };

    reader.readAsText(xmlFile);
  }

  function loadRoutechoicesFromOcad(event) {
    if (event.target.files.length === 0) {
      return;
    }

    const xmlFile = event.target.files[0];
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
    if (
      courseXmlDoc === undefined ||
      classIndex === undefined ||
      routechoicesXmlDoc === undefined
    ) {
      alert("Fill all the inputs");
      return;
    }

    const coursecoords = iofXmlCourseExportTo2dRerunJson(
      courseXmlDoc,
      classIndex
    );

    const tags = gpxRoutechoicesExportTo2DRerunJson(routechoicesXmlDoc);

    console.log(coursecoords, tags);
  }
</script>

<header>
  <h2>Upload from OCAD exports</h2>
</header>

<form on:submit|preventDefault={parseXmlFiles}>
  <label for="course-file-input">
    Course file (IOF XML 3.0)

    <input
      on:change={loadCourseFromOCAD}
      id="course-file-input"
      name="course-file-input"
      type="file"
    />
  </label>

  <label for="class-select">
    class

    <select
      bind:value={classIndex}
      name="class-select"
      id="class-select"
      disabled={classNames.length === 0}
    >
      <option />
      {#each classNames as clsName, index}
        <option value={index}>{clsName}</option>
      {/each}
    </select>
  </label>

  <label for="routechoices-file-input">
    Routechoices (XML)

    <input
      on:change={loadRoutechoicesFromOcad}
      id="routechoices-file-input"
      name="routechoices-file-input"
      type="file"
    />
  </label>

  <footer class="button-wrapper">
    <button
      class="outline"
      type="button"
      on:click={() => (isDialogOpen = false)}>Cancel</button
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
</style>
