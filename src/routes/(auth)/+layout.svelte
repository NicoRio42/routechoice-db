<script>
	import NavBar from '$lib/components/NavBar.svelte';

	export let data;
</script>

<NavBar user={data.user} logoLinkHref="/" />

<slot></slot>
