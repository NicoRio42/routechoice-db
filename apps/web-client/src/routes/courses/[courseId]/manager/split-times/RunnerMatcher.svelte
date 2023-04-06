<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import type Runner from "../../../shared/o-utils/models/runner";
  import type { RunnerForMatching } from "../../../shared/o-utils/two-d-rerun/runners-matcher";
  import type { Mapviewer } from "../../../shared/o-utils/models/2d-rerun/mapviewer";

  export let runners: Runner[] = [];
  export let users: RunnerForMatching[] = [];
  export let loading = false;

  const dispatchSubmit = createEventDispatcher<{
    submit: { runners: Runner[] };
  }>();

  const dispatchPrevious = createEventDispatcher<{ previous: undefined }>();

  // @ts-ignore
  const mapViewer: Mapviewer = mapviewer;
  const routes = mapViewer.routes.sort((routeA, routeB) =>
    routeA.runnername.localeCompare(routeB.runnername)
  );

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
        <th>User</th>
      </tr>
    </thead>

    <tbody>
      {#each runners as runner}
        <tr>
          <td>{`${runner.firstName} ${runner.lastName}`}</td>

          <td>
            <select bind:value={runner.trackingDeviceId}>
              <option value={null} />

              {#each routes as route}
                {@const key = `loggator-${route.unit.replace("Log", "")}`}

                <option value={key}>{route.runnername}</option>
              {/each}
            </select>
          </td>

          <td>
            <select bind:value={runner.userId}>
              <option value={null} />

              {#each users as user}
                <option value={user.key}>{user.name}</option>
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
    <button aria-busy={loading} disabled={loading} type="submit"
      >Save split times</button
    >
  </footer>
</form>

<style>
  .footer {
    display: flex;
    gap: 1rem;
  }
</style>
