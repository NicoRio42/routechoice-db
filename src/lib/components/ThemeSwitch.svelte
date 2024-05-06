<button
	class="btn-unset moon flex justify-center items-center p-1 rounded-full border border-solid border-table-border-color"
	type="button"
	on:click={() => document.documentElement.dataset.theme = "dark"}
>
	<i class="i-carbon-moon w-5 h-5 block " />
</button>

<button
	class="btn-unset sun hidden justify-center items-center p-1 rounded-full border border-solid border-table-border-color"
	type="button"
	on:click={() => document.documentElement.dataset.theme = "light"}
>
	<i class="i-carbon-light w-5 h-5 block " />
</button>

<style>
	@media (prefers-color-scheme: dark) {
		.moon {
			display: none;
		}

		.sun {
			display: flex;
		}
	}

	:global(html[data-theme='light']) .moon {
			display: flex;
	}

	:global(html[data-theme='light']) .sun {
			display: none;
	}

	:global(html[data-theme='dark']) .moon {
			display: none;
	}

	:global(html[data-theme='dark']) .sun {
			display: flex;
	}
</style>
