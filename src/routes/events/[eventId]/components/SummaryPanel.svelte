<script lang="ts">
	import type { Routechoice } from 'orienteering-js/models';
	import type { Runner } from 'orienteering-js/models';
	import { secondsToPrettyTime } from './SplitTimesTable/utils.js';

	export let sortedRunnersWithOneLeg: Runner[];
	export let legRoutechoices: Routechoice[];
</script>

<div class="panel">
	{#each sortedRunnersWithOneLeg.slice(0, 5) as runner (runner.id)}
		{@const leg = runner.legs[0]}

		{#if leg !== null}
			<p style:color={runner.track?.color}>
				{runner.lastName}: {secondsToPrettyTime(leg.time)}s
				{#if leg.detectedRouteChoice !== null}
					({leg.detectedRouteChoice.name})
				{/if}
			</p>
		{/if}
	{/each}

	<hr />

	{#each legRoutechoices as routechoice (routechoice.id)}
		<p style:color={routechoice.color}>{routechoice.name}: {Math.round(routechoice.length)} m</p>
	{/each}
</div>

<style>
	.panel {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		background-color: rgba(182, 182, 182, 0.158);
		backdrop-filter: blur(10px);
		z-index: 1;
		padding: 0.125rem 0.25rem;
		border-radius: 0.5rem;
	}

	p {
		font-size: 0.75rem;
		line-height: 1.125;
		margin: 0;
	}

	hr {
		margin: 0.125rem;
	}
</style>
