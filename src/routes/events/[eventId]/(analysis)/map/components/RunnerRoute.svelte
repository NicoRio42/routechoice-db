<script lang="ts">
	import type { RunnerLeg } from '$lib/server/db/models.js';
	import type { RunnerTrack } from 'orienteering-js/models';
	import { settingsStore } from '../settings-store';
	import LineString from './LineString.svelte';
	import { cropTrackFromLegNumber } from './utils.js';
	import { addAlpha } from '$lib/helpers';

	export let runnerLeg: RunnerLeg;
	export let track: RunnerTrack;
	export let name: string;
	export let startTime: Date;
	export let timeOffset: number;
	export let isEmphasized = false;
	export let zIndex: number;

	let coords: number[][] = [];

	$: coords = cropTrackFromLegNumber(runnerLeg, track, startTime, timeOffset);
</script>

{#if isEmphasized}
	<LineString
		{coords}
		color="#fff"
		width={10}
		text={$settingsStore.runnersLabels === 'nextToTrack' ? name : undefined}
		{zIndex}
	/>
{/if}

<LineString
	{coords}
	color={addAlpha(track.color, $settingsStore.runnersTracksOpacity)}
	width={isEmphasized ? 6 : 5}
	text={$settingsStore.runnersLabels === 'nextToTrack' ? name : undefined}
	{zIndex}
/>
