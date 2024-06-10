<script lang="ts">
	import { Map, View } from 'ol';
	import { getCenter } from 'ol/extent';
	import type { Polygon } from 'ol/geom';
	import { fromExtent } from 'ol/geom/Polygon';
	import DblClickDragZoom from 'ol/interaction/DblClickDragZoom.js';
	import DoubleClickZoom from 'ol/interaction/DoubleClickZoom.js';
	import 'ol/ol.css';
	import { onDestroy, onMount, setContext } from 'svelte';

	export let angle: number;
	export let fitBox: [number, number, number, number];
	export let padding: [number, number, number, number];
	export let isDrawingNewRoutechoice: boolean;

	let map: Map;
	let view: View;

	$: {
		if (view !== undefined) {
			const center = getCenter(fitBox);

			const resolution = view.getResolutionForExtent(
				rotatedExtentForGeometry(fromExtent(fitBox), angle)
			);

			view.animate({ center, rotation: angle, resolution, duration: 1000 });
		}
	}

	function rotatedExtentForGeometry(geometry: Polygon, rotation: number) {
		const cosAngle = Math.cos(rotation);
		const sinAngle = Math.sin(-rotation);
		const coords = geometry.getFlatCoordinates();
		const stride = geometry.getStride();
		let minRotX = +Infinity;
		let minRotY = +Infinity;
		let maxRotX = -Infinity;
		let maxRotY = -Infinity;
		for (let i = 0, ii = coords.length; i < ii; i += stride) {
			const rotX = coords[i] * cosAngle - coords[i + 1] * sinAngle;
			const rotY = coords[i] * sinAngle + coords[i + 1] * cosAngle;
			minRotX = Math.min(minRotX, rotX);
			minRotY = Math.min(minRotY, rotY);
			maxRotX = Math.max(maxRotX, rotX);
			maxRotY = Math.max(maxRotY, rotY);
		}
		return [minRotX, minRotY, maxRotX, maxRotY];
	}

	setContext('map', () => map);

	onMount(() => {
		view = new View({ constrainRotation: false, padding });

		map = new Map({
			target: 'mapviewer',
			view,
			controls: []
		});

		map.addInteraction(new DoubleClickZoom());
		map.addInteraction(new DblClickDragZoom({ delta: -0.01 }));

		view.fit(fitBox);
	});

	onDestroy(() => {
		if (map !== undefined) map.dispose();
	});
</script>

<div id="mapviewer" class="map" style:cursor={isDrawingNewRoutechoice ? 'crosshair' : 'auto'} />

{#if map}
	<slot />
{/if}

<style>
	#mapviewer {
		width: 100%;
		height: 100%;
	}
</style>
