<script lang="ts">
	import { secondsToPrettyTime } from '$lib/utils/split-times';
	import type { RunnerLeg } from '$lib/server/db/models';
	import TimeRank from '../../components/TimeRank.svelte';

	export let runnerLeg: RunnerLeg | null;
	export let stickyBottom = false;
	export let isLastSplit = false;

	function computeMistakeOpacity() {
		if (runnerLeg === null || runnerLeg.timeLoss === 0) return '0%';
		if (runnerLeg.timeLoss > 60) return '100%';
		if (runnerLeg.timeLoss < 20) return '20%';
		return `${Math.round((runnerLeg.timeLoss * 100) / 60)}%`;
	}
</script>

<td
	style:--mistake-opacity={computeMistakeOpacity()}
	class:mistake={runnerLeg?.timeLoss !== undefined && runnerLeg?.timeLoss !== 0}
	class:stickyBottom
>
	{#if runnerLeg}
		<div class="nowrap tooltip-container">
			{#if runnerLeg?.time}
				<TimeRank time={runnerLeg.time} rank={runnerLeg?.rankSplit} {isLastSplit} />
			{/if}

			{#if runnerLeg.timeBehindSplit || runnerLeg.timeLoss}
				<div class="tooltip" class:tooltip-top={stickyBottom}>
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
			{#if runnerLeg?.timeOverall}
				<TimeRank time={runnerLeg.timeOverall} rank={runnerLeg?.rankOverall} />
			{/if}

			{#if runnerLeg.timeBehindOverall}
				<div class="tooltip" class:tooltip-top={stickyBottom}>
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

	:global(table tbody tr) td.mistake {
		background-color: color-mix(
			in srgb,
			hsl(0, 54%, 70%) var(--mistake-opacity),
			var(--pico-background-color)
		);
	}

	@media (prefers-color-scheme: dark) {
		:global(table tbody tr) td.mistake {
			background-color: color-mix(
				in srgb,
				hsl(0, 41%, 39%) var(--mistake-opacity),
				var(--pico-background-color)
			);
		}
	}

	:global(html[data-theme='light'] table tr) td.mistake {
		background-color: color-mix(
			in srgb,
			hsl(0, 54%, 70%) var(--mistake-opacity),
			var(--pico-background-color)
		);
	}

	:global(html[data-theme='dark'] table tr) td.mistake {
		background-color: color-mix(
			in srgb,
			hsl(0, 41%, 39%) var(--mistake-opacity),
			var(--pico-background-color)
		);
	}

	.stickyBottom {
		position: sticky;
		bottom: 0;
		background-color: var(--pico-background-color);
		border-top: 0.1875rem solid var(--pico-table-border-color);
	}
</style>
