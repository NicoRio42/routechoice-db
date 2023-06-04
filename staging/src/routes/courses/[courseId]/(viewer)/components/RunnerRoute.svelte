<script lang="ts">
	import type { Runner } from 'orienteering-js/models';
	import LineString from './LineString.svelte';
	import { cropTrackFromLegNumber } from './utils.js';

	export let runner: Runner;
	export let legNumber: number;

	let coords: number[][] = [];
	const color = runner.track!.color;

	$: coords = cropTrackFromLegNumber(runner, legNumber);
</script>

<LineString {coords} {color} width={5} text={runner.lastName} />
