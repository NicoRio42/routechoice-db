<script lang="ts">
	import LineString from './LineString.svelte';
	import { transform } from 'ol/proj.js';
	import type { ControlPoint, Routechoice } from '$lib/server/db/models.js';
	import { addAlpha } from '$lib/helpers.js';
	import { settingsStore } from '../settings-store';
	import { getTransformCallbackToRemapAPairOfPoints } from '../utils';
	import type { LegWithRoutechoices } from '$lib/models/leg.model';

	export let routechoice: Routechoice;
	export let opacity: number;
	export let width: number;
	export let selectedLeg: LegWithRoutechoices;
	export let controlPoints: ControlPoint[];

	const color = addAlpha(routechoice.color, opacity);

	const latitudes = routechoice.latitudes.split(';').map(Number);
	const longitudes = routechoice.longitudes.split(';').map(Number);

	const startControlPoint = controlPoints.find((c) => c.id === selectedLeg.fkStartControlPoint)!;
	const finishControlPoint = controlPoints.find((c) => c.id === selectedLeg.fkFinishControlPoint)!;

	const trackFirstPoint = [latitudes[0], longitudes[0]] as const;
	const trackLastPoint = [latitudes[latitudes.length], longitudes[longitudes.length]] as const;

	const callback = getTransformCallbackToRemapAPairOfPoints(
		[trackFirstPoint, trackLastPoint],
		[
			[startControlPoint.latitude, startControlPoint.longitude],
			[finishControlPoint.latitude, finishControlPoint.longitude]
		]
	);

	let coords = latitudes.map((lat, index) => {
		const lon = longitudes[index];
		const [correctedLat, correctedLon] = callback([lat, lon]);
		return transform([correctedLon, correctedLat], 'EPSG:4326', 'EPSG:3857');
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
