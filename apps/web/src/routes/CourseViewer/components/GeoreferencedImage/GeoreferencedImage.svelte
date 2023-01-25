<script lang="ts">
  import type { Map } from "ol";
  import ImageLayer from "ol/layer/Image";
  import { transformExtent } from "ol/proj";
  import Static from "ol/source/ImageStatic.js";
  import type { MapCalibration } from "shared/o-utils/models/course-map";
  import { getContext, onDestroy, onMount } from "svelte";

  //https://codesandbox.io/s/kw9l85y5po
  export let url: string;
  export let mapCalibration: MapCalibration;

  const getMap = getContext<() => Map>("map");
  let map: Map;
  let imageLayer: ImageLayer<Static>;

  onMount(() => {
    map = getMap();

    // let mapPoints = [
    //   transform(
    //     [mapCalibration[0].gps.lon, mapCalibration[0].gps.lat],
    //     "EPSG:4326",
    //     "EPSG:3857"
    //   ),
    //   transform(
    //     [mapCalibration[1].gps.lon, mapCalibration[1].gps.lat],
    //     "EPSG:4326",
    //     "EPSG:3857"
    //   ),
    //   transform(
    //     [mapCalibration[2].gps.lon, mapCalibration[2].gps.lat],
    //     "EPSG:4326",
    //     "EPSG:3857"
    //   ),
    // ];

    // let imagePoints = [
    //   [mapCalibration[0].point.x, mapCalibration[0].point.y],
    //   [mapCalibration[1].point.x, mapCalibration[1].point.y],
    //   [mapCalibration[2].point.x, mapCalibration[2].point.y],
    // ];

    const imageLayer = new ImageLayer({ zIndex: 1 });
    map.addLayer(imageLayer);

    // const imageExtent = [
    //   0,
    //   0,
    //   mapCalibration[2].point.x,
    //   mapCalibration[2].point.y,
    // ];

    // const imageProjection = new Projection({
    //   code: "georef-image",
    //   units: "pixels",
    //   extent: imageExtent,
    // });

    // const matrixParams = calculate(mapPoints, imagePoints);

    // addCoordinateTransforms(
    //   "EPSG:3857",
    //   imageProjection,
    //   (coords: number[]) => transformProjection(coords, matrixParams),
    //   (coords: number[]) => coords // TODO transform
    // );

    const extendMercator = [
      Math.min(
        mapCalibration[0].gps.lon,
        mapCalibration[1].gps.lon,
        mapCalibration[2].gps.lon
      ),
      Math.min(
        mapCalibration[0].gps.lat,
        mapCalibration[1].gps.lat,
        mapCalibration[2].gps.lat
      ),
      Math.max(
        mapCalibration[0].gps.lon,
        mapCalibration[1].gps.lon,
        mapCalibration[2].gps.lon
      ),
      Math.max(
        mapCalibration[0].gps.lat,
        mapCalibration[1].gps.lat,
        mapCalibration[2].gps.lat
      ),
    ];

    const extent = transformExtent(extendMercator, "EPSG:4326", "EPSG:3857");

    imageLayer.setSource(
      new Static({
        url,
        // projection: imageProjection,
        imageExtent: extent,
      })
    );
  });

  onDestroy(() => {
    if (map !== undefined) map.removeLayer(imageLayer);
  });
</script>
