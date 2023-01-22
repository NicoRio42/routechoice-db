<script lang="ts">
  import { Feature } from "ol";
  import type { Coordinate } from "ol/coordinate";
  import type { Geometry } from "ol/geom";
  import { LineString } from "ol/geom";
  import type VectorLayer from "ol/layer/Vector";
  import type VectorSource from "ol/source/Vector";
  import Stroke from "ol/style/Stroke";
  import Style from "ol/style/Style";
  import { getContext, onDestroy, onMount } from "svelte";

  export let color: string;
  export let coords: Coordinate[];
  export let width: number;

  let vectorLayer: VectorLayer<VectorSource<Geometry>>, lineFeature: Feature;

  const getVectorLayer =
    getContext<() => VectorLayer<VectorSource<Geometry>>>("vectorLayer");

  onMount(() => {
    vectorLayer = getVectorLayer();
    const vectorSource = vectorLayer.getSource();

    const line = new LineString(coords);

    lineFeature = new Feature(line);
    const stroke = new Stroke({ color, width });
    const style = new Style({ stroke });
    lineFeature.setStyle(style);

    vectorSource?.addFeature(lineFeature);
  });

  onDestroy(() => {
    if (lineFeature !== undefined)
      vectorLayer?.getSource()?.removeFeature(lineFeature);
  });
</script>
