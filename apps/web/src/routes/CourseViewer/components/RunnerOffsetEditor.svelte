<script lang="ts" context="module">
  import type Runner from "../../../../shared/o-utils/models/runner";
  import { writable } from "svelte/store";

  const showDialog = writable(false);
  const runnerId = writable<string>();
  let submit: Function;
  let cancel: Function;

  export function getNewRunnerOffset(
    rnrId: string
  ): Promise<[number, boolean]> {
    runnerId.set(rnrId);
    showDialog.set(true);

    return new Promise<[number, boolean]>((resolve, reject) => {
      submit = resolve;
      cancel = reject;
    });
  }
</script>

<script lang="ts">
  // This component mutates de runner's timeOffset corresponding to the runnerId
  // but it reinitializes it on cancellation or submition
  import type CourseData from "../../../../shared/o-utils/models/course-data";

  export let courseData: CourseData;
  let initialOffset: number;
  let runners = courseData.runners;

  let offset: number;
  let runner: Runner;
  let applyToAllRunners = false;

  runnerId.subscribe((id) => {
    const foundRunner = runners.find((r) => r.id === id);

    if (foundRunner !== undefined) {
      runner = foundRunner;
      offset = runner.timeOffset;
      initialOffset = runner.timeOffset;
    }
  });

  $: {
    if (runner !== undefined) {
      runner.timeOffset = offset;
      courseData = courseData;
    }
  }

  function handleCancel() {
    cancel();
    offset = initialOffset;
    $showDialog = false;
  }

  function handleSubmit() {
    submit([offset, applyToAllRunners]);
    offset = initialOffset;
    $showDialog = false;
  }
</script>

{#if $showDialog}
  <form on:submit|preventDefault={handleSubmit}>
    <button type="button" on:click={() => offset--}>-</button>

    <input type="number" bind:value={offset} />

    <button type="button" on:click={() => offset++}>+</button>

    <label for="every-runners"
      >Apply to all runners

      <input
        type="checkbox"
        name="every-runners"
        bind:checked={applyToAllRunners}
      />
    </label>

    <button type="submit">Change offset</button>

    <button type="button" class="outline" on:click={handleCancel}>Cancel</button
    >
  </form>
{/if}

<style>
  form {
    position: absolute;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    gap: 1rem;
    background-color: rgba(255, 255, 255, 0.733);
    padding: 0.5rem 1rem;
  }

  form button,
  form input,
  form label {
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }
</style>
