<script lang="ts">
	import { Map, View } from 'ol';
	import DoubleClickZoom from 'ol/interaction/DoubleClickZoom.js';
	import DblClickDragZoom from 'ol/interaction/DblClickDragZoom.js';
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
			view.setRotation(angle);
			view.fit(fitBox, { padding });
		}
	}

	setContext('map', () => map);

	onMount(() => {
		view = new View({ constrainRotation: false });

		map = new Map({
			target: 'mapviewer',
			view,
			controls: []
		});

		map.addInteraction(new DoubleClickZoom());
		map.addInteraction(new DblClickDragZoom({ delta: -0.01 }));

		view.fit(fitBox, { padding });
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
