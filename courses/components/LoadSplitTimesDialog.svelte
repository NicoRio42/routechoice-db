<script lang="ts">
  import courseData from "../stores/course-data";
  import { loadRunnersSplitsTo2dRerun } from "../utils/2d-rerun-hacks/load-splits-to-2d-rerun";
  import type { Mapviewer } from "../../shared/o-utils/models/2d-rerun/mapviewer";
  import type Runner from "../../shared/o-utils/models/runner";
  import { detectRunnersRoutechoices } from "../../shared/o-utils/routechoice-detector/routechoice-detector";
  import { parseIOFXML3SplitTimesFile } from "../../shared/o-utils/split-times/parsers/iof-xml-3";
  import {
    attribute2DRerunTrackToMatchedRunner,
    matchRunnersByName,
  } from "../../shared/o-utils/two-d-rerun/runners-matcher";
  import clickOutside from "../../shared/use/clickOutside";
  import { timeZones } from "../utils/time-zones";

  export let isDialogOpen = false;

  let parser: DOMParser;
  let reader: FileReader;

  // @ts-ignore
  const mapViewer: Mapviewer = mapviewer;

  let className: string;
  let xmlDoc: XMLDocument;
  let timeOffset = 0;
  let timeZone = timeZones[1];
  let classNames: string[] = [];
  let step = 1;
  let runners: Runner[] = [];

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
    };

    reader.readAsText(xmlFile);
  };

  const parseIOFXML = () => {
    if (xmlDoc === undefined || className === undefined) {
      alert("You have to load a file and select a class.");
      return;
    }

    try {
      const rawRunners = parseIOFXML3SplitTimesFile(
        xmlDoc,
        className,
        timeZone,
        timeOffset
      );

      const matchedRunners = matchRunnersByName(rawRunners, mapViewer.routes);

      runners = attribute2DRerunTrackToMatchedRunner(
        matchedRunners,
        mapViewer.routes
      );
    } catch (error) {
      alert("An error occured while parsing the split times.");
      console.error(error);
      return;
    }

    step += 1;
  };

  const saveSplitTimes = () => {
    runners = detectRunnersRoutechoices($courseData.legs, runners);
    runners.forEach((runner) => (runner.track = null)); // So the runner track is not persisted t Firebase

    // TODO reimplement statistics
    loadRunnersSplitsTo2dRerun(runners);

    $courseData.runners = runners;

    isDialogOpen = false;
  };
</script>

<dialog open>
  <article use:clickOutside={() => (isDialogOpen = false)}>
    <header>
      <a
        aria-label="Close"
        class="close"
        on:click={() => (isDialogOpen = false)}
      />

      <strong>Upload split times</strong>
    </header>

    <form
      class="step"
      on:submit|preventDefault={parseIOFXML}
      class:slide-right={step === 2}
    >
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
          <option value={timeZone}>{timeZone}</option>
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
          on:click={() => (isDialogOpen = false)}>Cancel</button
        >

        <button type="submit">Load splits</button>
      </footer>
    </form>

    <form
      on:submit|preventDefault={saveSplitTimes}
      class="step"
      class:slide-left={step === 1}
    >
      <table>
        <thead>
          <tr>
            <th>Split times</th>
            <th>GPS track</th>
          </tr>
        </thead>

        <tbody>
          {#each runners as runner}
            <tr>
              <td>{`${runner.firstName} ${runner.lastName}`}</td>

              <td>
                <select
                  bind:value={runner.foreignKeys.twoDRerunRouteIndexNumber}
                >
                  {#each mapViewer.routes as route}
                    <option value={route.indexnumber}>{route.runnername}</option
                    >
                  {/each}
                </select>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <footer class="footer">
        <button type="button" class="outline" on:click={() => (step = 1)}
          >Cancel</button
        >
        <button type="submit">Save split times</button>
      </footer>
    </form>
  </article>
</dialog>

<style>
  .step {
    transform: translateX(0);
    height: auto;
    transition: transform 0.5s ease;
  }

  .slide-left {
    transform: translateX(-100%);
    height: 0;
    overflow: hidden;
    margin: 0;
  }

  .slide-right {
    transform: translateX(100%);
    height: 0;
    overflow: hidden;
    margin: 0;
    transition: transform 0.5s ease;
  }

  .footer {
    display: flex;
    gap: 1rem;
    position: sticky;
    left: 0;
    bottom: -1rem;
    right: 0;
    background-color: white;
    border-top: 1px solid lightgray;
    padding: 1rem 0;
  }

  .footer button {
    margin-bottom: 0;
  }
</style>
