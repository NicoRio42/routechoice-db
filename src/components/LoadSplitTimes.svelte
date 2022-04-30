<script>
  import { createEventDispatcher } from "svelte";

  import { IOFXMLParser } from "../utils/iof-xml-parser/IOFXMLParser";
  import { detectRunnersByName } from "../utils/detect-runners-by-name/detectRunnersByName";

  import { timeZones } from "./time-zones";

  /**@type {IOFXMLParser}*/
  export let savedSplitTimes;
  export let mapviewer;

  /**@type {XMLDocument}*/
  let xmlDoc;

  /**@type {string[]}*/
  let classNames = [];

  /**@type {string}*/
  let className;
  let timeZone = timeZones[1];
  let timeOffset = 0;

  /**@type {IOFXMLParser}*/
  let splitTimes;

  /**@type {import("../models/runner").Runner[]}*/
  let runners = [];
  let step = 1;

  const dispatch = createEventDispatcher();

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
    splitTimes = new IOFXMLParser(xmlDoc, className, timeZone, 1.2, timeOffset);

    runners = detectRunnersByName(
      [...splitTimes.runners],
      [...mapviewer.routes]
    );

    step += 1;

    console.log(splitTimes, runners);
  };

  const saveSplitTimes = () => {
    savedSplitTimes = splitTimes;
    savedSplitTimes.runners = runners;
    dispatch("close");
  };
</script>

<form class="step" on:submit={parseIOFXML} class:slide-right={step === 2}>
  <label for="iof-xml-file">Load IOF XML File</label>
  <input
    name="iof-xml-file"
    id="iof-xml-file"
    on:change={(e) => onFileSelected(e)}
    type="file"
  />

  <label for="class">Class</label>
  <select name="class" id="class" bind:value={className}>
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
    <button type="button" class="outline" on:click={() => dispatch("close")}
      >Cancel</button
    >
    <button type="submit">Load splits</button>
  </footer>
</form>

<form on:submit={saveSplitTimes} class="step" class:slide-left={step === 1}>
  <table>
    <thead>
      <tr>
        <th>Split times</th>
        <th>GPS track</th>
        <!-- <th>Routechoice DB user</th> -->
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

          <!-- <td>Soon</td> -->
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
