<div
	class="flex items-center gap-1 p-1 rounded-10 border border-solid border-table-border-color w-min"
>
	<button
		class="btn-unset flex justify-center items-center dark"
		type="button"
		onclick="this.closest('html').dataset.theme = 'dark'"
	>
		<i class="i-carbon-moon" />
	</button>

	<button
		class="btn-unset flex justify-center items-center light"
		type="button"
		onclick="this.closest('html').dataset.theme = 'light'"
	>
		<i class="i-carbon-light" />
	</button>
</div>

<style>
	.light {
		color: rgb(187, 198, 206);
	}

	.dark {
		color: rgb(65, 84, 98);
	}

	@media (prefers-color-scheme: dark) {
		.light {
			color: rgb(187, 198, 206);
		}

		.dark {
			color: rgb(65, 84, 98);
		}
	}

	:global(html[data-theme='light']) .light {
		color: rgb(187, 198, 206);
	}

	:global(html[data-theme='light']) .dark {
		color: rgb(65, 84, 98);
	}

	:global(html[data-theme='dark']) .light {
		color: rgb(187, 198, 206);
	}

	:global(html[data-theme='dark']) .dark {
		color: rgb(65, 84, 98);
	}
</style>
