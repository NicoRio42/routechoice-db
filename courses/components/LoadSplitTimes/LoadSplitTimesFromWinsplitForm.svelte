<script lang="ts">
  import { timeZones } from "../../utils/time-zones";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import type { SplitSubmitEvent } from "./models/split-submit-event";

  interface WinsplitObject {
    id: string;
    name: string;
  }

  const url =
    "https://europe-west1-routechoice-db-dev.cloudfunctions.net/getWinsplitData";
  const parser = new DOMParser();

  let date: string;
  let eventId: number;
  let classInfo: WinsplitObject;
  let timeZone = timeZones[2];
  let timeOffset = 0;

  let events: WinsplitObject[] = [];
  let classes: WinsplitObject[] = [];

  const dispatchSubmit = createEventDispatcher<{ submit: SplitSubmitEvent }>();
  const dispatchPrevious = createEventDispatcher<{ previous: undefined }>();

  async function handleDateChange() {
    const response = await fetch(`${url}?date=${date}`);
    const text = await response.text();

    const xmlDoc = parser.parseFromString(text.toString(), "application/xml");
    const eventTags = xmlDoc.querySelectorAll("Event");

    events = Array.from(eventTags).map((eventTag) => {
      const idTag = eventTag.querySelector("Id");
      const nameTag = eventTag.querySelector("Name");

      if (idTag === null || nameTag === null)
        throw new Error("Problem with file format");

      const id = idTag.textContent;
      const name = nameTag.textContent;

      if (id === null || name === null)
        throw new Error("Problem with file format");

      return {
        id,
        name,
      };
    });
  }

  async function handleEventChange() {
    const response = await fetch(`${url}?id=${eventId}`);
    const text = await response.text();

    const xmlDoc = parser.parseFromString(text.toString(), "application/xml");
    const eventTags = xmlDoc.querySelectorAll("Class");

    classes = Array.from(eventTags).map((eventTag) => {
      const idTag = eventTag.querySelector("Id");
      const nameTag = eventTag.querySelector("Name");

      if (idTag === null || nameTag === null)
        throw new Error("Problem with file format");

      const id = idTag.textContent;
      const name = nameTag.textContent;

      if (id === null || name === null)
        throw new Error("Problem with file format");

      return {
        id,
        name,
      };
    });
  }

  async function handleSubmit() {
    const response = await fetch(
      `${url}?id=${eventId}&classid=${classInfo.id}`
    );
    const text = await response.text();

    const xmlDoc = parser.parseFromString(text.toString(), "application/xml");

    dispatchSubmit("submit", {
      xmlDoc,
      className: classInfo.name,
      timeOffset,
      timeZone,
    });
  }
</script>

<form on:submit|preventDefault={handleSubmit} transition:fade>
  <label for=""
    >Date

    <input type="date" bind:value={date} on:change={handleDateChange} />
  </label>

  <label for=""
    >Event

    <select bind:value={eventId} on:change={handleEventChange}>
      {#each events as e}
        <option value={e.id}>{e.name}</option>
      {/each}
    </select>
  </label>

  <label for=""
    >Class

    <select bind:value={classInfo}>
      {#each classes as cl}
        <option value={cl}>{cl.name}</option>
      {/each}
    </select>
  </label>

  <label for="time-zone"
    >Time zone

    <select bind:value={timeZone} name="time-zone" id="time-zone"
      >timeZone
      {#each timeZones as timeZone}
        <option value={timeZone}>{timeZone}</option>
      {/each}
    </select>
  </label>

  <label for="time-offset"
    >Time offset (seconds)

    <input
      bind:value={timeOffset}
      type="number"
      name="time-offset"
      id="time-offset"
    />
  </label>

  <footer class="footer">
    <button
      type="button"
      class="outline"
      on:click={() => dispatchPrevious("previous")}>Cancel</button
    >

    <button type="submit">Load splits</button>
  </footer>
</form>

<style>
  .footer {
    display: flex;
    gap: 1rem;
  }
</style>
