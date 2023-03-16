<script lang="ts">
	import type { Map } from 'ol';
	import ImageLayer from 'ol/layer/Image';
	import { addCoordinateTransforms, Projection, transform } from 'ol/proj';
	import Static from 'ol/source/ImageStatic.js';
	import { getContext, onDestroy, onMount } from 'svelte';
	import { CoordinatesConverter } from '$lib/o-utils/map/coords-converter';
	import type { MapCalibration } from '$lib/o-utils/models/course-map';
	import type ImageWrapper from 'ol/Image';
	import { imageReference } from '$lib/o-utils/loggator/map-calibration';

	export let url: string;
	export let mapCalibration: MapCalibration;

	const coordinatesConverter = new CoordinatesConverter(mapCalibration);

	const getMap = getContext<() => Map>('map');
	let map: Map;
	let imageLayer: ImageLayer<Static>;

	onMount(() => {
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
			url,
			projection: imageProjection,
			imageExtent,
			imageLoadFunction: (img: ImageWrapper, src: string) => {
				if (imageReference.length === 0) {
					console.log('Image reference not found');
					(img.getImage() as HTMLImageElement).src = src;
					return;
				}

				img.setImage(imageReference[0]);
			}
		});

		staticImage.addEventListener('imageloadend', (e) => {
			console.log(staticImage.getImageExtent());
		});

		imageLayer.setSource(staticImage);
		map.addLayer(imageLayer);
	});

	onDestroy(() => {
		if (map !== undefined) map.removeLayer(imageLayer);
	});
</script>
