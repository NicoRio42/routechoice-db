<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { clickOutside } from '$lib/actions/click-outside';
	import { eventStore } from '$lib/stores/event-store';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	export let data;

	let showDropdown = false;
	$eventStore = { name: data.event.name, id: data.event.id };

	afterNavigate(() => (showDropdown = false));

	onDestroy(() => ($eventStore = null));
</script>

<div
	class="absolute top-13 left-50% -translate-x-50% z-2"
	use:clickOutside={() => (showDropdown = false)}
>
	<div class="bg-background-color rounded">
		<button
			class="mb-0 min-w-50 w-fit outline flex items-center justify-between py-2"
			on:click={() => (showDropdown = !showDropdown)}
		>
			{#if $page.url.pathname.includes('map')}
				Map
			{:else if $page.url.pathname.includes('table')}
				Split times
			{:else if $page.url.pathname.includes('leader-graph')}
				Leader graph
			{:else if $page.url.pathname.includes('superman-graph')}
				Superman graph
			{/if}

			<i class="i-carbon-chevron-down"></i>
		</button>
	</div>

	{#if showDropdown}
		<ul
			class="p-4 m-0 mt-1 rounded shadow-2xl bg-background-color flex flex-col gap-2"
			transition:fade={{ duration: 125 }}
		>
			<li class="list-none">
				<a class="decoration-none" href="/events/{$page.params.eventId}/map">Map</a>
			</li>

			<li class="list-none">
				<a class="decoration-none" href="/events/{$page.params.eventId}/table">Split times</a>
			</li>

			<li class="list-none">
				<a class="decoration-none" href="/events/{$page.params.eventId}/leader-graph">
					Leader graph
				</a>
			</li>

			<li class="list-none">
				<a class="decoration-none" href="/events/{$page.params.eventId}/superman-graph">
					Superman graph
				</a>
			</li>
		</ul>
	{/if}
</div>

<slot></slot>
