<script lang="ts">
  import { Runner } from "../models/runner";

  import { IOFXMLParser } from "../utils/iof-xml-parser/IOFXMLParser";
  import { detectRunnersByName } from "../utils/detect-runners-by-name/detectRunnersByName";

  import { timeZones } from "./time-zones";

  export let savedSplitTimes: IOFXMLParser;
  export let mapviewer;

  let fileinput: HTMLElement;
  let xmlDoc: XMLDocument;
  let classNames: string[] = [];
  let className: string;
  let timeZone = timeZones[1];
  let timeOffset = 0;
  let splitTimes: IOFXMLParser;
  let runners: Runner[] = [];

  const onFileSelected = (event) => {
    let xmlFile = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
      let readXml = e.target.result;
      let parser = new DOMParser();
      xmlDoc = parser.parseFromString(readXml.toString(), "application/xml");
      classNames = Array.from(
        xmlDoc.querySelectorAll("ClassResult Class Name")
      ).map((cl) => cl.innerHTML);
    };

    reader.readAsText(xmlFile);
  };

  const parseIOFXML = (event) => {
    event.preventDefault();
    splitTimes = new IOFXMLParser(xmlDoc, className, 1.2, timeZone, timeOffset);

    runners = detectRunnersByName(
      [...splitTimes.runners],
      [...mapviewer.routes]
    );

    console.log(splitTimes, runners);
  };

  const saveSplitTimes = () => {
    savedSplitTimes = { ...splitTimes, runners: runners };
  };
</script>

<form on:submit={parseIOFXML}>
  <p>
    <label for="iof-xml-file">IOF XML File</label>
    <input
      name="iof-xml-file"
      id="iof-xml-file"
      on:change={(e) => onFileSelected(e)}
      type="file"
      bind:this={fileinput}
    />
    <button type="button" on:click={() => fileinput.click()}
      >Load IOF XML File</button
    >
  </p>

  <p>
    <label for="class">Class</label>
    <select name="class" id="class" bind:value={className}>
      {#each classNames as className}
        <option value={className}>{className}</option>
      {/each}
    </select>
  </p>

  <p>
    <label for="time-zone">Time zone</label>
    <select bind:value={timeZone} name="time-zone" id="time-zone"
      >timeZone
      {#each timeZones as timeZone}
        <option value={timeZone}>{timeZone}</option>
      {/each}
    </select>
  </p>

  <p>
    <label for="time-offset">Time offset (seconds)</label>
    <input
      bind:value={timeOffset}
      type="number"
      name="time-offset"
      id="time-offset"
    />
  </p>

  <button type="submit">Load splits</button>
</form>

<table>
  <thead>
    <tr>
      <th>Split times</th>
      <th>GPS track</th>
      <th>Routechoice DB user</th>
    </tr>
  </thead>

  <tbody>
    {#each runners as runner}
      <tr>
        <td>{`${runner.firstName} ${runner.lastName}`}</td>

        <td>
          <select bind:value={runner.rerun2dRouteIndex}>
            {#each mapviewer.routes as route, index}
              <option value={index}>{route.runnername}</option>
            {/each}
          </select>
        </td>

        <td>Soon</td>
      </tr>
    {/each}
  </tbody>
</table>

<button type="submit" on:click={saveSplitTimes}>Save split times</button>

<style>
  input[type="file"] {
    display: none;
  }

  form {
    display: grid;
    grid-template-columns: 50% 50%;
  }

  p {
    display: flex;
    flex-direction: column;
  }
</style>
