<script lang="ts">
  import { timeZones } from "../../utils/time-zones";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import type { SplitSubmitEvent } from "./models/split-submit-event";

  export let loading = false;

  let reader: FileReader;
  let parser: DOMParser;

  const dispatchSubmit = createEventDispatcher<{ submit: SplitSubmitEvent }>();
  const dispatchPrevious = createEventDispatcher<{ previous: undefined }>();

  let xmlDoc: XMLDocument;
  let classNames: string[] = [];
  let className: string;
  let timeOffset = 0;
  let timeZone = timeZones[2];

  interface FormEventHandler<T> {
    currentTarget: T;
  }

  const onFileSelected = (event: FormEventHandler<HTMLInputElement>) => {
    const fileInputElement = event.currentTarget;

    if (fileInputElement === null || fileInputElement.files === null) return;

    let xmlFile = fileInputElement.files[0];
    if (xmlFile === undefined) return;
    if (reader === undefined) reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      if (e.target === null) return;
      const readXml = e.target.result;
      if (readXml === null) return;
      if (parser === undefined) parser = new DOMParser();

      xmlDoc = parser.parseFromString(readXml.toString(), "application/xml");

      if (xmlDoc === null) return;
      const resultListTag = xmlDoc.querySelector("ResultList");
      if (resultListTag === null) return;
      const IOFXMLVersion = resultListTag.getAttribute("iofVersion");

      if (IOFXMLVersion !== "3.0") {
        alert("Only IOF XML 3.0 split times files are supported yet.");
        return;
      }

      const classQuerySelector =
        IOFXMLVersion === "3.0"
          ? "ClassResult Class Name"
          : "ClassResult ClassShortName";

      classNames = Array.from(xmlDoc.querySelectorAll(classQuerySelector)).map(
        (cl) => cl.innerHTML
      );

      if (classNames.length > 0) className = classNames[0];

      const dateTag = xmlDoc.querySelector("Date");

      if (dateTag === null || dateTag.textContent === null) return;

      // Trying to guess the timezone
      try {
        const date = new Date(dateTag.textContent);
        const timeZoneOffset = date.getTimezoneOffset();

        const foundTimeZone = timeZones.find(
          (tz) => tz.timezoneOffset === timeZoneOffset
        );

        if (foundTimeZone !== undefined) timeZone = foundTimeZone;
      } catch (error) {
        console.error(error);
      }
    };

    reader.readAsText(xmlFile);
  };

  function handleSubmit() {
    if (xmlDoc === undefined || className === undefined) {
      alert("You have to load a file and select a class.");
      return;
    }

    dispatchSubmit("submit", {
      xmlDoc,
      className,
      timeOffset,
      timeZone: timeZone.value,
    });
  }
</script>

<form class="step" on:submit|preventDefault={handleSubmit} in:fade>
  <label for="iof-xml-file">Load IOF XML File</label>
  <input
    name="iof-xml-file"
    id="iof-xml-file"
    on:change={onFileSelected}
    type="file"
  />

  <label for="class">Class</label>
  <select
    name="class"
    id="class"
    bind:value={className}
    disabled={classNames.length === 0}
  >
    {#each classNames as className}
      <option value={className}>{className}</option>
    {/each}
  </select>

  <label for="time-zone">Time zone</label>
  <select bind:value={timeZone} name="time-zone" id="time-zone"
    >timeZone
    {#each timeZones as timeZone}
      <option value={timeZone}>{timeZone.value}</option>
    {/each}
  </select>

  <label for="time-offset">Time offset (seconds)</label>
  <input
    bind:value={timeOffset}
    type="number"
    name="time-offset"
    id="time-offset"
  />

  <footer class="footer">
    <button
      type="button"
      class="outline"
      on:click={() => dispatchPrevious("previous")}>Cancel</button
    >

    <button type="submit" disabled={loading} aria-busy={loading}
      >Load splits</button
    >
  </footer>
</form>

<style>
  .footer {
    display: flex;
    gap: 1rem;
  }
</style>
