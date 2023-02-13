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
    <div class="wrapper">
      <button type="button" on:click={() => offset--} class="counter-button"
        >-</button
      >

      <input type="number" bind:value={offset} />

      <button type="button" on:click={() => offset++} class="counter-button"
        >+</button
      >
    </div>

    <div class="wrapper">
      <label class="all-runners" for="all-runners"
        >Apply to all runners

        <input
          type="checkbox"
          name="all-runners"
          bind:checked={applyToAllRunners}
        />
      </label>

      <button type="button" class="outline cancel" on:click={handleCancel}
        >Cancel</button
      >

      <button type="submit" class="submit">Change offset</button>
    </div>
  </form>
{/if}

<style>
  form {
    position: absolute;
    bottom: 3.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    background-color: rgba(255, 255, 255, 0.733);
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: column;
  }

  .cancel,
  .submit {
    padding: 0.5rem 1rem;
    margin: 0;
    white-space: nowrap;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .counter-button {
    border-radius: 1.5rem;
    width: 3rem;
    height: 3rem;
  }

  .wrapper {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .all-runners {
    font-size: 0.75rem;
    white-space: nowrap;
  }
</style>
