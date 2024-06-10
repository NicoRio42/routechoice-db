<script lang="ts">
	export let isDrawingNewRoutechoice: boolean;
</script>

<!-- I nead a div because pico overides the background-color css var for outline buttons -->
<div class="absolute top-12 right-2 z-1 bg-background-color rounded-md">
	<button on:click class="outline flex items-center justify-center p-2">
		{#if isDrawingNewRoutechoice}
			<i class="block i-carbon-edit-off"></i>
		{:else}
			<i class="block i-carbon-edit"></i>
		{/if}
	</button>
</div>
