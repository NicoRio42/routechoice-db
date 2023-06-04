<script>
	import { navigating } from '$app/stores';
	import NavBar from './_components/NavBar.svelte';

	import './global.css';
	import 'uno.css';

	export let data;
</script>

<div class="relative flex flex-col h-100%">
	{#if $navigating !== null}
		<progress class="fixed h-1 border rounded-none" />
	{/if}

	<NavBar user={data.user} />

	<slot />
</div>
