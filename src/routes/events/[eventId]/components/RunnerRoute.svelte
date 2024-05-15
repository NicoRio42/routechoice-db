<script lang="ts">
	import type { RunnerLeg } from '$lib/server/db/schema.js';
	import type { RunnerTrack } from 'orienteering-js/models';
	import LineString from './LineString.svelte';
	import { cropTrackFromLegNumber } from './utils.js';

	export let runnerLeg: RunnerLeg;
	export let track: RunnerTrack;
	export let name: string;
	export let startTime: Date;
	export let timeOffset: number;

	let coords: number[][] = [];
	const color = track.color;

	$: coords = cropTrackFromLegNumber(runnerLeg, track, startTime, timeOffset);
</script>

<LineString {coords} {color} width={5} text={name} />
