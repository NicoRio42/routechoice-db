<script lang="ts">
	import { secondsToPrettyTime } from '$lib/utils/split-times';
	import GreenJersey from './GreenJersey.svelte';
	import Medal from './Medal.svelte';

	export let time: number;
	export let rank: number | null;
	export let isLastSplit = false;

	function getTextColor(rank: number) {
		if (rank === 1 && isLastSplit) return 'text-green';
		if (rank === 1) return 'text-gold';
		if (rank === 2) return 'text-silver';
		if (rank === 3) return 'text-bronze';
	}
</script>

<div class:bold={rank !== null && rank <= 3} class="wrapper {getTextColor(rank ?? 0)}">
	{secondsToPrettyTime(time)}

	{#if rank !== null}
		{#if rank > 3}
			<small>
				({rank})
			</small>
		{:else if isLastSplit && rank === 1}
			<GreenJersey />
		{:else}
			<Medal {rank} />
		{/if}
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.bold {
		font-weight: bold;
	}

	.text-green {
		color: green;
	}

	.text-bronze {
		color: #ff5733;
	}

	.text-silver {
		color: #c0c0c0;
	}

	.text-gold {
		color: #ffd700;
	}
</style>
