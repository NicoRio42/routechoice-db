<script>
	import { navigating } from '$app/stores';
	import NavBar from '$lib/components/NavBar.svelte';
	import Notifications from '$lib/components/Notifications.svelte';

	import './global.css';
	// Do not remove this comment, it is there to prevent the formatter to change the order of the style sheets
	import 'uno.css';

	export let data;

	let tooFast = false;

	$: {
		if ($navigating !== null) {
			tooFast = true;
			setTimeout(() => (tooFast = false), 250);
		}
	}
</script>

<Notifications />

<div class="relative flex flex-col h-100%">
	{#if $navigating !== null && $navigating.to?.route.id !== '/(protected)/events/[eventId]/(viewer)' && !tooFast}
		<progress class="fixed h-1 border rounded-none" />
	{/if}

	<NavBar user={data.user} />

	<slot />
</div>
