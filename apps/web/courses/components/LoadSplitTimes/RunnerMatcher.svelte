<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import type Runner from "../../../shared/o-utils/models/runner";
  import type { RunnerForMatching } from "../../../shared/o-utils/two-d-rerun/runners-matcher";

  export let runners: Runner[] = [];
  export let users: RunnerForMatching[] = [];
  export let loading = false;

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
        <th>User</th>
      </tr>
    </thead>

    <tbody>
      {#each runners as runner}
        <tr>
          <td>{`${runner.firstName} ${runner.lastName}`}</td>

          <td>
            <select bind:value={runner.foreignKeys.twoDRerunRouteIndexNumber}>
              <option />

              {#each mapViewer.routes as route}
                <option value={route.indexnumber}>{route.runnername}</option>
              {/each}
            </select>
          </td>

          <td>
            <select bind:value={runner.foreignKeys.userId}>
              <option />

              {#each users as user}
                <option value={user.foreignKey}>{user.name}</option>
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
