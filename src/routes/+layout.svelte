<script>
	import { navigating } from '$app/stores';
	import Notifications from '$lib/components/Notifications.svelte';
	import NavBar from '$lib/components/NavBar.svelte';

	import './global.css';
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
