<script lang="ts">
	import type Routechoice from '$lib/o-utils/models/routechoice';
	import LineString from './LineString.svelte';
	import { transform } from 'ol/proj';
	import { addAlpha } from './utils';

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
