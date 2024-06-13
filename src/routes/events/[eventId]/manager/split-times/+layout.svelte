<script>
	import NavBar from '$lib/components/NavBar.svelte';

	export let data;
</script>

<NavBar
	user={data.user}
	eventName={data.event.name}
	backLinkHref="/events/{data.event.id}/manager"
/>

<slot></slot>
