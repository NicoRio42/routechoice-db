<script lang="ts">
	import { secondsToPrettyTime } from './utils.js';
	import TimeRank from './TimeRank.svelte';
	import type { RunnerLeg } from '$lib/server/db/schema.js';

	export let runnerLeg: RunnerLeg | null;
	export let isLastSplit = false;

	function computeMistakeOpacity() {
		if (runnerLeg === null || runnerLeg.timeLoss === 0) return '0%';
		if (runnerLeg.timeLoss > 60) return '100%';
		if (runnerLeg.timeLoss < 20) return '20%';
		return `${(runnerLeg.timeLoss * 100) / 60}%`;
	}
</script>

<td
	style:--mistake-opacity={computeMistakeOpacity()}
	class:mistake={runnerLeg !== null && runnerLeg.timeLoss !== 0}
>
	{#if runnerLeg}
		<div class="nowrap tooltip-container">
			{#if runnerLeg?.time}
				<TimeRank time={runnerLeg.time} rank={runnerLeg?.rankSplit} {isLastSplit} />
			{/if}

			{#if runnerLeg.timeBehindSplit || runnerLeg.timeLoss}
				<div class="tooltip">
					{#if runnerLeg.timeBehindSplit}
						<div class="nowrap">
							+&nbsp;{secondsToPrettyTime(runnerLeg.timeBehindSplit)}
						</div>
					{/if}

					{#if runnerLeg.timeLoss}
						<div class="nowrap">
							Time lost:&nbsp;{secondsToPrettyTime(runnerLeg.timeLoss)}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="nowrap tooltip-container">
			{#if runnerLeg.timeOverall}
				<TimeRank time={runnerLeg.timeOverall} rank={runnerLeg.rankOverall} />
			{/if}

			{#if runnerLeg.timeBehindOverall}
				<div class="tooltip">
					+&nbsp;{secondsToPrettyTime(runnerLeg.timeBehindOverall)}
				</div>
			{/if}
		</div>
	{/if}
</td>

<style>
	.nowrap {
		white-space: nowrap;
	}

	:global(table tr) td.mistake {
		background-color: color-mix(
			in srgb,
			hsl(0, 54%, 70%) var(--mistake-opacity),
			var(--background-color)
		);
	}

	@media (prefers-color-scheme: dark) {
		:global(table tr) td.mistake {
			background-color: color-mix(
				in srgb,
				hsl(0, 41%, 39%) var(--mistake-opacity),
				var(--background-color)
			);
		}
	}

	:global(html[data-theme='light'] table tr) td.mistake {
		background-color: color-mix(
			in srgb,
			hsl(0, 54%, 70%) var(--mistake-opacity),
			var(--background-color)
		);
	}

	:global(html[data-theme='dark'] table tr) td.mistake {
		background-color: color-mix(
			in srgb,
			hsl(0, 41%, 39%) var(--mistake-opacity),
			var(--background-color)
		);
	}
	
	.tooltip-container {
		position: relative;
	}

	.tooltip-container:hover .tooltip,
	.tooltip-container:active .tooltip {
		visibility: visible;
		opacity: 1;
	}

	.tooltip {
		z-index: 2;
		display: inline-block;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: 100%;
		color: #fff;
		background-color: #616161;
		padding-left: 8px;
		padding-right: 8px;
		text-align: center;
		border-radius: 4px;
		visibility: hidden;
		opacity: 0;
		transition: visibility 0s, opacity 0.25s linear;
	}

	.tooltip-right {
		top: 50%;
		transform: translateY(-50%);
		left: 100%;
	}

	.tooltip-top {
		top: unset;
		bottom: 100%;
	}
</style>
