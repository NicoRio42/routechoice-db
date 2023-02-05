<script lang="ts">
  import type Routechoice from "shared/o-utils/models/routechoice";
  import LineString from "./LineString.svelte";
  import { transform } from "ol/proj";

  export let routechoice: Routechoice;
  export let opacity: number;
  export let width: number;

  function addAlpha(color: string, opacity: number) {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }

  const color = addAlpha(routechoice.color, opacity);

  const coords = routechoice.track.map(([lat, lon]) => {
    return transform([lon, lat], "EPSG:4326", "EPSG:3857");
  });

  const text = `${routechoice.name} ${Math.round(routechoice.length)}m`;
</script>

<LineString {coords} {color} {width} {text} />
