<script lang="ts">
	import type { Routechoice } from 'orienteering-js/models';
	import LineString from './LineString.svelte';
	import { transform } from 'ol/proj.js';
	import { addAlpha } from './utils.js';

	export let routechoice: Routechoice;
	export let opacity: number;
	export let width: number;

	const color = addAlpha(routechoice.color, opacity);

	const coords = routechoice.track.map(([lat, lon]) => {
		return transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
	});

	const text = `${routechoice.name} ${Math.round(routechoice.length)}m`;
</script>

<LineString {coords} {color} {width} {text} />
