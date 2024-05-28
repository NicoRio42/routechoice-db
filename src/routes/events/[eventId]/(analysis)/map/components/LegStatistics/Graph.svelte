<script lang="ts">
	import type { GraphItem } from './models/graph-item.js';

	export let data: GraphItem[];
	export let suffix = '';

	let max = 0;

	$: max = Math.max(...data.map((item) => item.value).filter((d): d is number => d !== null));
</script>

{#each data as item}
	<p class="graph-item">
		{item.label}
		
		{#if item.value === null}
			<span class="text-xs ml-3">No data</span>
		{:else}
			{@const barWidth = (item.value * 100) / max}

			<span class="bar-group">
				<span
					style:background-color={item.color}
					style:width="{barWidth}%"
					class="bar"
				>
					<span
						class="value"
						style:top={barWidth < 10 ? '0' : '0.5rem'}
						style:right={barWidth < 10 ? '-0.5rem' : '0.25rem'}
					>
						{item.value}{suffix}
					</span>
				</span>
			</span>
		{/if}
	</p>
{/each}

<style>
	.graph-item {
		display: flex;
		align-items: center;
		padding-right: 1rem;
	}

	.bar-group {
		margin-left: 0.5rem;
		position: relative;
		width: 100%;
		height: 0.5rem;
		border: none;
	}

	.bar {
		position: absolute;
		border-radius: 2px;
		height: 100%;
	}

	.value {
		position: absolute;
		font-size: smaller;
	}
</style>
