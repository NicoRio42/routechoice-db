<script lang="ts">
	import { Feature } from 'ol';
	import type { Coordinate } from 'ol/coordinate.js';
	import type { Geometry } from 'ol/geom.js';
	import { Point } from 'ol/geom.js';
	import type VectorLayer from 'ol/layer/Vector.js';
	import type VectorSource from 'ol/source/Vector.js';
	import { getContext, onDestroy, onMount } from 'svelte';

	export let coords: Coordinate;

	let vectorLayer: VectorLayer<VectorSource<Geometry>>, lineFeature: Feature;
	let marker: Point;

	$: if (marker !== undefined) marker.setCoordinates(coords);

	const getVectorLayer = getContext<() => VectorLayer<VectorSource<Geometry>>>('vectorLayer');

	onMount(() => {
		vectorLayer = getVectorLayer();
		const vectorSource = vectorLayer.getSource();

		marker = new Point(coords);

		lineFeature = new Feature(marker);

		vectorSource?.addFeature(lineFeature);
	});

	onDestroy(() => {
		if (lineFeature !== undefined) vectorLayer?.getSource()?.removeFeature(lineFeature);
	});
</script>
