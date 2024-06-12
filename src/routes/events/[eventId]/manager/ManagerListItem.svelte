<script lang="ts">
	export let href: string;
	export let disabled = false;
</script>

<li>
	<a href={disabled ? '#' : href} class:disabled>
		<slot></slot>

		{#if !disabled}
			<i class="i-carbon-arrow-right inline-block w-5 h-5"></i>
		{/if}
	</a>
</li>

<style>
	li {
		list-style: none;
		margin: 0;
		border-top: solid 1px var(--pico-table-border-color);
	}

	li a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.5rem 0.5rem 0;
	}

	li a:hover {
		background-color: var(--pico-dropdown-hover-background-color);
	}

	li a.disabled {
		color: grey !important;
		text-decoration-color: grey;
		cursor: initial;
	}

	li:last-child {
		border-bottom: solid 1px var(--pico-table-border-color);
	}
</style>
