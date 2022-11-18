<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import type Runner from "../../../shared/o-utils/models/runner";

  export let runners: Runner[] = [];

  const dispatchSubmit = createEventDispatcher<{
    submit: { runners: Runner[] };
  }>();
  const dispatchPrevious = createEventDispatcher<{ previous: undefined }>();

  // @ts-ignore
  const mapViewer: Mapviewer = mapviewer;

  function handleSubmit() {
    dispatchSubmit("submit", { runners });
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="step" in:fade>
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
            <select bind:value={runner.foreignKeys.twoDRerunRouteIndexNumber}>
              {#each mapViewer.routes as route}
                <option value={route.indexnumber}>{route.runnername}</option>
              {/each}
            </select>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <footer class="footer">
    <button
      type="button"
      class="outline"
      on:click={() => dispatchPrevious("previous")}>Cancel</button
    >
    <button type="submit">Save split times</button>
  </footer>
</form>

<style>
  .footer {
    display: flex;
    gap: 1rem;
  }
</style>
