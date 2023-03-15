<script lang="ts">
	import type Runner from '$lib/o-utils/models/runner';
	import LineString from './LineString.svelte';
	import { cropTrackFromLegNumber } from './utils';

	export let runner: Runner;
	export let legNumber: number;

	let coords: number[][] = [];
	const color = runner.track!.color;

	$: coords = cropTrackFromLegNumber(runner, legNumber);
</script>

<LineString {coords} {color} width={5} text={runner.lastName} />
