<script lang="ts">
	import type { Map } from 'ol';
	import ImageLayer from 'ol/layer/Image.js';
	import { addCoordinateTransforms, Projection, transform } from 'ol/proj.js';
	import Static from 'ol/source/ImageStatic.js';
	import { getContext, onDestroy, onMount } from 'svelte';
	import { CoordinatesConverter } from 'orienteering-js/map';
	import type { CourseMap } from 'orienteering-js/models';
	import type ImageWrapper from 'ol/Image.js';
	import { cachedImages, getMapCallibrationByFetchingMapImageIfNeeded } from '$lib/client/map.js';

	export let eventMap: CourseMap;

	const getMap = getContext<() => Map>('map');
	let map: Map;
	let imageLayer: ImageLayer<Static>;

	onMount(async () => {
		const mapCalibration = await getMapCallibrationByFetchingMapImageIfNeeded(eventMap);
		const coordinatesConverter = new CoordinatesConverter(mapCalibration);
		map = getMap();

		const imageExtent = [1, 1, mapCalibration[2].point.x, mapCalibration[1].point.y];

		const imageProjection = new Projection({
			code: 'georef-image',
			units: 'pixels',
			extent: imageExtent
		});

		addCoordinateTransforms(
			'EPSG:3857',
			imageProjection,
			(coords: number[]) => {
				const [lon, lat] = transform(coords, 'EPSG:3857', 'EPSG:4326');
				const [x, y] = coordinatesConverter.latLongToXY([lat, lon]);

				return [x, mapCalibration[1].point.y - y];
			},
			([x, y]: number[]) => {
				const [lat, lon] = coordinatesConverter.xYToLatLong([x, mapCalibration[1].point.y - y]);
				return transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
			}
		);

		const imageLayer = new ImageLayer({ zIndex: 1 });

		const staticImage = new Static({
			url: eventMap.url,
			projection: imageProjection,
			imageExtent,
			imageLoadFunction: (img: ImageWrapper, src: string) => {
				const imageElemnt = cachedImages[eventMap.url];

				if (imageElemnt === undefined) {
					(img.getImage() as HTMLImageElement).src = src;
					return;
				}

				img.setImage(imageElemnt);
			}
		});

		imageLayer.setSource(staticImage);
		map.addLayer(imageLayer);
	});

	onDestroy(() => {
		if (map !== undefined) map.removeLayer(imageLayer);
	});
</script>
