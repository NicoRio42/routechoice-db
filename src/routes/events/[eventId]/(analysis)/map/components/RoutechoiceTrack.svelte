<script lang="ts">
	import LineString from './LineString.svelte';
	import { transform } from 'ol/proj.js';
	import type { Routechoice } from '$lib/server/db/models.js';
	import { addAlpha } from '$lib/helpers.js';
	import { settingsStore } from '../settings-store';

	export let routechoice: Routechoice;
	export let opacity: number;
	export let width: number;

	const color = addAlpha(routechoice.color, opacity);

	const latitudes = routechoice.latitudes.split(';').map(Number);
	const longitudes = routechoice.longitudes.split(';').map(Number);

	const coords = latitudes.map((lat, index) => {
		const lon = longitudes[index];
		return transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
	});

	let text = `${routechoice.name} ${Math.round(routechoice.length)}m`;

	if (routechoice.elevation !== null) {
		text += ` | ${Math.round(routechoice.elevation)} m`;
	}
</script>

<LineString
	{coords}
	{color}
	{width}
	text={$settingsStore.routechoicesLabels === 'nextToTrack' ? text : undefined}
/>
