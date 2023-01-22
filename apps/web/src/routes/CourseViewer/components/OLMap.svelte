<script lang="ts">
  import { Map, View } from "ol";
  import "ol/ol.css";
  import { onDestroy, onMount, setContext } from "svelte";

  export let angle: number;
  export let fitBox: [number, number, number, number];
  export let padding: number;

  let map: Map;
  let view: View;

  $: {
    if (view !== undefined) {
      view.setRotation(angle);
      view.fit(fitBox, { padding: [padding, padding, padding, padding] });
    }
  }

  setContext("map", () => map);

  onMount(() => {
    view = new View();

    map = new Map({
      target: "mapviewer",
      view,
    });

    view.fit(fitBox, { padding: [padding, padding, padding, padding] });
  });

  onDestroy(() => {
    if (map !== undefined) map.dispose();
  });
</script>

<div id="mapviewer" class="map" />

{#if map}
  <slot />
{/if}

<style>
  #mapviewer {
    width: 100%;
    height: 100%;
  }
</style>
