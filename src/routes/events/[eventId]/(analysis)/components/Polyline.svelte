<script lang="ts">
	export let points: number[][];
	export let color: string;
</script>

<polyline fill="none" stroke={color} points={points.map(([x, y]) => `${x},${y}`).join(' ')} />

<style>
	polyline {
		vector-effect: non-scaling-stroke;
	}
</style>
