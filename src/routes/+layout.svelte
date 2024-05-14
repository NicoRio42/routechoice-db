<script lang="ts">
	import { navigating } from '$app/stores';
	import NavBar from '$lib/components/NavBar.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import { onNavigate } from '$app/navigation';
	import type { OnNavigate } from '@sveltejs/kit';

	import '@picocss/pico/css/pico.css';
	// Do not remove this comment, it is there to prevent the formatter to change the order of the style sheets
	import './global.css';
	// Do not remove this comment, it is there to prevent the formatter to change the order of the style sheets
	import './global-view-transitions.css';
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

	function isBackNavigation({ from, to }: OnNavigate): boolean {
		if (from === null || to === null) return false;

		return from.url.pathname !== to.url.pathname && from.url.pathname.startsWith(to.url.pathname);
	}

	function isSamePageNavigation({ from, to }: OnNavigate): boolean {
		if (from === null || to === null) return false;

		return from.url.pathname === to.url.pathname;
	}

	onNavigate((navigation) => {
		//@ts-ignore
		if (!document.startViewTransition) return;

		if (isBackNavigation(navigation)) {
			document.documentElement.classList.add('back-transition');
		}

		if (isSamePageNavigation(navigation)) {
			document.documentElement.classList.add('same-page-navigation');
		}

		return new Promise(async (resolve) => {
			//@ts-ignore
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});

			try {
				await transition.finished;
			} catch (e) {
				console.error(e);
			} finally {
				document.documentElement.classList.remove('back-transition', 'same-page-navigation');
			}
		});
	});
</script>

<Notifications />

<div class="relative flex flex-col h-100%">
	{#if $navigating !== null && $navigating.to?.route.id !== '/(protected)/events/[eventId]/(viewer)' && !tooFast}
		<progress class="fixed h-1 border rounded-none" />
	{/if}

	<NavBar user={data.user} />

	<slot />
</div>
