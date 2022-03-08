<script lang="ts">
  import { IOFXMLParser } from "../utils/iof-xml-parser/IOFXMLParser";

  import { timeZones } from "./time-zones";

  let fileinput;
  let xmlDoc;
  let classNames = ["------------"];
  let className;
  let splitTimes;

  export let savedSplitTimes;

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

  const parseIOFXML = () => {
    const date = new Date("2021-04-03");
    splitTimes = new IOFXMLParser(xmlDoc, className, 1.2, date, "+01:00");

    console.log(splitTimes);
  };
</script>

<div class="time-offset">
  <label for="time-offset">Time offset (seconds)</label>
  <input type="number" name="time-offset" id="time-offset" />
</div>

<div>
  <label for="iof-xml-file">IOF XML File</label>
  <input
    name="iof-xml-file"
    id="iof-xml-file"
    on:change={(e) => onFileSelected(e)}
    type="file"
    bind:this={fileinput}
  />
  <button on:click={() => fileinput.click()}>Load IOF XML File</button>
</div>

<div>
  <label for="class">Class</label>
  <select
    name="class"
    id="class"
    bind:value={className}
    on:change={parseIOFXML}
  >
    {#each classNames as className}
      <option value={className}>{className}</option>
    {/each}
  </select>
</div>

<div>
  <label for="time-zone">Time zone</label>
  <select name="time-zone" id="time-zone">
    {#each timeZones as timeZone}
      <option value={timeZone}>{timeZone}</option>
    {/each}
  </select>
</div>

<h2>Correspondance with routes</h2>

<button on:click={() => (savedSplitTimes = { ...splitTimes })}
  >Save split times</button
>

<style>
  input[type="file"] {
    display: none;
  }
</style>
