<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { functionsBaseURL } from "../../../environments/environment";
  import { formatDateForDateInput } from "../../../shared/utils/date";
  import course from "../../stores/course";
  import { timeZones } from "../../utils/time-zones";
  import type { SplitSubmitEvent } from "./models/split-submit-event";

  interface WinsplitObject {
    id: string;
    name: string;
  }

  export let loading = false;

  const url = `${functionsBaseURL}/getWinsplitData`;

  const parser = new DOMParser();

  let date: string | null = null;
  let eventId: number | null = null;
  let classInfo: WinsplitObject | null = null;
  let timeZone = timeZones[2];
  let timeOffset = 0;

  let eventsAreLoading = false;
  let classesAreLoading = false;

  let events: WinsplitObject[] = [];
  let classes: WinsplitObject[] = [];

  const dispatchSubmit = createEventDispatcher<{ submit: SplitSubmitEvent }>();
  const dispatchPrevious = createEventDispatcher<{ previous: undefined }>();

  const eventDate = new Date($course.date);
  date = formatDateForDateInput(eventDate);
  handleDateChange();

  async function handleDateChange() {
    eventsAreLoading = true;
    events = [];
    eventId = null;
    classes = [];
    classInfo = null;

    // Trying to guess the timezone
    const dateObject = new Date(date!);
    const timeZoneOffset = dateObject.getTimezoneOffset();

    const foundTimeZone = timeZones.find(
      (tz) => tz.timezoneOffset === timeZoneOffset
    );

    if (foundTimeZone !== undefined) timeZone = foundTimeZone;

    const response = await fetch(`${url}?date=${date}`);
    eventsAreLoading = false;

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
    classesAreLoading = true;
    classes = [];
    classInfo = null;
    const response = await fetch(`${url}?id=${eventId}`);
    classesAreLoading = false;

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
    if (date === null || eventId === null || classInfo === null) return;

    const response = await fetch(
      `${url}?id=${eventId}&classid=${classInfo.id}`
    );
    const text = await response.text();

    const xmlDoc = parser.parseFromString(text.toString(), "application/xml");

    dispatchSubmit("submit", {
      xmlDoc,
      className: classInfo.name,
      timeOffset,
      timeZone: timeZone.value,
    });
  }
</script>

<form on:submit|preventDefault={handleSubmit} transition:fade>
  <label for="dateInput"
    >Date

    <input
      id="dateInput"
      name="dateInput"
      type="date"
      bind:value={date}
      on:change={handleDateChange}
    />
  </label>

  <label for="eventSelect" aria-busy={eventsAreLoading}
    >Event

    <select
      id="eventSelect"
      name="eventSelect"
      bind:value={eventId}
      on:change={handleEventChange}
    >
      {#each events as e}
        <option value={e.id}>{e.name}</option>
      {/each}
    </select>
  </label>

  <label for="classSelect" aria-busy={classesAreLoading}
    >Class

    <select id="classSelect" name="classSelect" bind:value={classInfo}>
      {#each classes as cl}
        <option value={cl}>{cl.name}</option>
      {/each}
    </select>
  </label>

  <label for="timeZoneInput"
    >Time zone

    <select bind:value={timeZone} name="timeZoneInput" id="timeZoneInput"
      >timeZone
      {#each timeZones as timeZone}
        <option value={timeZone}>{timeZone.value}</option>
      {/each}
    </select>
  </label>

  <label for="timeOffsetInput"
    >Time offset (seconds)

    <input
      bind:value={timeOffset}
      type="number"
      name="timeOffsetInput"
      id="time-offset"
    />
  </label>

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
