<script lang="ts">
	export let href: string;
	export let disabled = false;
	export let disabledMessage: string | undefined = undefined;
</script>

<li>
	<a
		href={disabled ? '#' : href}
		class:cursor-initial={disabled}
		class:text-gray={disabled}
		class="decoration-none"
	>
		<slot></slot>

		{#if !disabled}
			<i class="i-carbon-arrow-right inline-block w-5 h-5"></i>
		{:else if disabledMessage !== undefined}
			<span class="text-3.5 text-gray-200 bg-gray-600 rounded px-2">{disabledMessage}</span>
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

	li:last-child {
		border-bottom: solid 1px var(--pico-table-border-color);
	}
</style>
