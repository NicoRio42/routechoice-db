<script lang="ts">
	export let rank: number;

	function getMedalColor(rank: number) {
		if (rank === 1) return 'gold';
		if (rank === 2) return 'silver';
		if (rank === 3) return 'bronze';
	}
</script>

<small class="medal {getMedalColor(rank)}">{rank}</small>

<style>
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
</style>
