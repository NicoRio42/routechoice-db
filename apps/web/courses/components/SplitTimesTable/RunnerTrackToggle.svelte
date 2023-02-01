<script lang="ts">
  import type { Mapviewer } from "shared/o-utils/models/2d-rerun/mapviewer";
  import { createEventDispatcher } from "svelte";

  export let isRunnerTrackShown = false;
  export let unitId: string;

  const dispatch = createEventDispatcher();

  $: {
    isRunnerTrackShown;
    onCheck();
  }

  $: dispatch("showRunnerTrack", isRunnerTrackShown);

  function onCheck(): void {
    // @ts-ignore
    const route = (mapviewer as Mapviewer)?.routes?.find(
      (r) => r.unit === unitId
    );

    if (route === undefined) return;

    const twoDRerunCheckbox = document.querySelector<HTMLDivElement>(
      `span[title*="${route.runnername}"]`
    )?.previousSibling as unknown as HTMLDivElement | null | undefined;

    if (
      twoDRerunCheckbox?.nodeType !== 1 ||
      (twoDRerunCheckbox.style.background === "rgb(255, 255, 255)" &&
        !isRunnerTrackShown)
    )
      return;

    twoDRerunCheckbox.click();
  }
</script>

<input type="checkbox" bind:checked={isRunnerTrackShown} on:input={onCheck} />
