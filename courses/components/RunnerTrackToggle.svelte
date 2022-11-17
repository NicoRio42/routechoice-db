<script lang="ts">
  import type { Mapviewer } from "shared/o-utils/models/2d-rerun/mapviewer";

  export let isRunnerTrackShown = false;
  export let twoDRerunRouteIndexNumber: unknown;

  function onCheck(): void {
    // @ts-ignore
    const route = (mapviewer as Mapviewer)?.routes?.find(
      (r) => r.indexnumber === (twoDRerunRouteIndexNumber as number)
    );

    if (route === undefined) return;

    const twoDRerunCheckbox = document.querySelector(
      `span[title*="${route.runnername}"]`
    )?.previousSibling;

    if (twoDRerunCheckbox?.nodeType === 1) {
      // @ts-ignore
      twoDRerunCheckbox.click();
    }
  }
</script>

<input type="checkbox" bind:checked={isRunnerTrackShown} on:input={onCheck} />
