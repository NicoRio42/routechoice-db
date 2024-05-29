<script lang="ts">
	export let isFirstValueSelected: boolean;
	export let firstLabel: string;
	export let secondLabel: string;
</script>

<div class="toggle-container flex px-4 mb-2">
	<button
		on:click={() => (isFirstValueSelected = true)}
		class="first-button w-full p-1 rounded-r-0 focus:shadow-none"
		class:not-selected={!isFirstValueSelected}
	>
		{firstLabel}
	</button>

	<button
		on:click={() => (isFirstValueSelected = false)}
		class="second-button w-full p-1 rounded-l-0 focus:shadow-none"
		class:not-selected={isFirstValueSelected}
	>
		{secondLabel}
	</button>
</div>

<style>
	.not-selected {
		background-color: transparent;
		color: var(--pico-primary);
	}
</style>
