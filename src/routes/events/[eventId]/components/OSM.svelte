<script lang="ts">
  import type { Map } from "ol";
  import TileLayer from "ol/layer/Tile.js";
  import OSM from "ol/source/OSM.js";
  import { getContext, onDestroy, onMount } from "svelte";

  const getMap = getContext<() => Map>("map");
  let map: Map;
  let tileLayer: TileLayer<OSM>;

  onMount(() => {
    map = getMap();

    tileLayer = new TileLayer({ zIndex: 0 });

    const source = new OSM();
    tileLayer.setSource(source);

    map?.addLayer(tileLayer);
  });

  onDestroy(() => {
    if (map !== undefined && tileLayer !== undefined)
      map.removeLayer(tileLayer);
  });
</script>
