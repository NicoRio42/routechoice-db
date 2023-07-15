<script lang="ts">
	import type { GraphItem } from './models/graph-item.js';

	export let data: GraphItem[];
	export let suffix = '';

	let max = 0;

	$: max = Math.max(...data.map((item) => item.value));
</script>

{#each data as item}
	<p class="graph-item">
		{item.label}<span class="bar-group">
			<span
				style:background-color={item.color}
				style:width={`${(item.value * 100) / max}%`}
				class="bar"><span class="value">{item.value}{suffix}</span></span
			>
		</span>
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
		right: 0.25rem;
		top: 0.5rem;
		font-size: smaller;
	}
</style>
