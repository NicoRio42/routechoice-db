<script>
	import { page } from '$app/stores';
	import { addSearchParamsToURL } from '$lib/helpers';
</script>

<!-- I nead a div because pico overides the background-color css var for outline buttons -->
<div class="absolute top-2 right-2 z-1 bg-background-color rounded-md">
	<a
		role="button"
		href={addSearchParamsToURL($page.url, 'showSettings', '')}
		data-sveltekit-replacestate
		class="outline !flex items-center justify-center p-2"
	>
		<i class="block i-carbon-settings"></i>
	</a>
</div>
