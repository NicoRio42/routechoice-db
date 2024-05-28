<script lang="ts">
	export let compact: boolean;
</script>

<button type="button" class="compact-button text-h1-color" on:click={() => (compact = !compact)}>
	{#if compact}
		<svg class="enlarge" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"
			><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
				d="M32 64c17.7 0 32 14.3 32 32l0 320c0 17.7-14.3 32-32 32s-32-14.3-32-32V96C0 78.3 14.3 64 32 64zm214.6 73.4c12.5 12.5 12.5 32.8 0 45.3L205.3 224l229.5 0-41.4-41.4c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L434.7 288l-229.5 0 41.4 41.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-96-96c-12.5-12.5-12.5-32.8 0-45.3l96-96c12.5-12.5 32.8-12.5 45.3 0zM640 96V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V96c0-17.7 14.3-32 32-32s32 14.3 32 32z"
			/></svg
		>
	{:else}
		<svg
			class="shrink"
			xmlns="http://www.w3.org/2000/svg"
			height="48"
			viewBox="0 96 960 960"
			width="48"
			><path
				d="M450 976V774l-86 86-44-44 160-160 160 160-44 44-86-86v202h-60ZM160 606v-60h640v60H160Zm320-110L320 336l44-44 86 86V176h60v202l86-86 44 44-160 160Z"
			/></svg
		>
	{/if}
</button>

<style>
	.compact-button {
		width: fit-content;
		background-color: transparent;
		box-shadow: none;
		border: none;
		margin: 0;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.shrink {
		width: 1.5rem;
		height: 1.5rem;
		transform: rotate(90deg);
	}

	.enlarge {
		width: 1.25rem;
		height: 1.25rem;
	}
</style>
