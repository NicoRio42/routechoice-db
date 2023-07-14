<script lang="ts">
	import type { Map } from 'ol';
	import type { Type } from 'ol/geom/Geometry.js';
	import Draw, { DrawEvent } from 'ol/interaction/Draw.js';
	import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';

	export let type: Type;

	const dispatch = createEventDispatcher<{ drawEnd: DrawEvent }>();
	let draw: Draw, map: Map;
	const getMap = getContext<() => Map>('map');

	function escapeCallback(event: KeyboardEvent) {
		if (event.code === 'Escape' && draw !== undefined) draw.abortDrawing();
	}

	onMount(() => {
		map = getMap();

		draw = new Draw({
			type
		});

		draw.on('drawend', (e) => dispatch('drawEnd', e));
		map.addInteraction(draw);

		document.addEventListener('keydown', escapeCallback);
	});

	onDestroy(() => {
		if (map !== undefined && draw !== undefined) map.removeInteraction(draw);
		document.removeEventListener('keydown', escapeCallback);
	});
</script>
