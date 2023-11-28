<script>
	import { navigating } from '$app/stores';
	import Logo from '$lib/components/Logo.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import NavBar from './_components/NavBar.svelte';

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

<Notifications></Notifications>

<div class="relative flex flex-col h-100%">
	{#if $navigating !== null && $navigating.to?.route.id !== '/(protected)/events/[eventId]/(viewer)' && !tooFast}
		<progress class="fixed h-1 border rounded-none" />
	{/if}

	<NavBar user={data.user} />

	{#if $navigating !== null && $navigating.to?.route.id === '/(protected)/events/[eventId]/(viewer)' && !tooFast}
		<div
			class="flex flex-col content-center items-center flex-shrink-0 flex-grow-1 mt-40% -translate-y-50%"
		>
			<Logo --width="10rem" --height="10rem" --logo-color="var(--primary)" />

			<p aria-busy="true" class="text-[var(--primary)]">Loading</p>
		</div>
	{:else}
		<slot />
	{/if}
</div>
