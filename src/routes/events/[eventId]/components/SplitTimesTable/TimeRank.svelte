<script lang="ts">
	import { secondsToPrettyTime } from './utils.js';

	export let time: number;
	export let rank: number | null;
	export let isLastSplit = false;

	function getTextColor(rank: number) {
		if (rank === 1 && isLastSplit) return 'text-green';
		if (rank === 1) return 'text-gold';
		if (rank === 2) return 'text-silver';
		if (rank === 3) return 'text-bronze';
	}

	function getMedalColor(rank: number) {
		if (rank === 1) return 'gold';
		if (rank === 2) return 'silver';
		if (rank === 3) return 'bronze';
	}
</script>

<div
	class:bold={rank !== null && rank <= 3}
	class="wrapper {getTextColor(rank ?? 0)}"
>
	{secondsToPrettyTime(time)}

	{#if rank !== null}
		{#if rank > 3}
			<small>
				({rank})
			</small>
		{:else if isLastSplit && rank === 1}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="1em"
				viewBox="0 0 640 512"
				class="green-jersey"
				><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
					d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z"
				/></svg
			>
		{:else}
			<small class="medal {getMedalColor(rank)}">{rank}</small>
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

	.medal {
		width: 1rem;
		height: 1rem;
		border-radius: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		color: hsl(205, 30%, 15%);
	}

	.bronze {
		background-color: #ff5733;
	}

	.silver {
		background-color: #c0c0c0;
	}

	.gold {
		background-color: #ffd700;
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

	.green-jersey {
		width: 1rem;
		height: 1rem;
		color: green;
	}
</style>
