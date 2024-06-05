<script lang="ts">
	import type { RunnerLeg } from '$lib/server/db/models.js';
	import type { RunnerTrack } from 'orienteering-js/models';
	import LineString from './LineString.svelte';
	import { cropTrackFromLegNumber } from './utils.js';
	import { settingsStore } from '../settings-store';

	export let runnerLeg: RunnerLeg;
	export let track: RunnerTrack;
	export let name: string;
	export let startTime: Date;
	export let timeOffset: number;
	export let isEmphasized = false;

	let coords: number[][] = [];
	const color = track.color;

	$: coords = cropTrackFromLegNumber(runnerLeg, track, startTime, timeOffset);
</script>

{#if isEmphasized}
	<LineString
		{coords}
		color="#fff"
		width={10}
		text={$settingsStore.runnersLabels === 'nextToTrack' ? name : undefined}
	/>
{/if}

<LineString
	{coords}
	{color}
	width={isEmphasized ? 6 : 5}
	text={$settingsStore.runnersLabels === 'nextToTrack' ? name : undefined}
/>
