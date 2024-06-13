<script lang="ts">
	let restPropsWithoutClass: SvelteRestProps = {};

	$: {
		restPropsWithoutClass = {};
		Object.entries($$restProps).forEach(([key, value]) => {
			if (key !== 'class') restPropsWithoutClass[key] = value;
		});
	}
</script>

<div class="flex justify-end">
	<button
		type="submit"
		class="sm:!w-fit flex items-center justify-center gap-2 {$$restProps.class}"
		{...restPropsWithoutClass}
	>
		<slot></slot>
	</button>
</div>
