<script lang="ts">
	import { page } from '$app/stores';
	import { addSearchParamsToURL } from '$lib/helpers';

	export let pageNumber: number;
	export let isLastPage: boolean;
</script>

<p class="flex justify-center items-center gap-4">
	{#if pageNumber === 1}
		<button class="outline w-fit m-0 p-2 rounded-10" disabled>
			<i class="i-carbon-arrow-left w-6 h-6 block" />
		</button>
	{:else}
		<a
			role="button"
			class="outline p-2 rounded-10"
			href={addSearchParamsToURL($page.url, 'pageNumber', `${pageNumber - 1}`)}
			data-sveltekit-noscroll
		>
			<i class="i-carbon-arrow-left w-6 h-6 block" />
		</a>
	{/if}

	{pageNumber}

	{#if isLastPage}
		<button class="outline w-fit m-0 p-2 rounded-10" disabled>
			<i class="i-carbon-arrow-right w-6 h-6 block" />
		</button>
	{:else}
		<a
			role="button"
			class="outline p-2 rounded-10"
			href={addSearchParamsToURL($page.url, 'pageNumber', `${pageNumber + 1}`)}
			data-sveltekit-noscroll
		>
			<i class="i-carbon-arrow-right w-6 h-6 block" />
		</a>
	{/if}
</p>
