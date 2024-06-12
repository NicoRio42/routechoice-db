<script>
	import NavBar from '$lib/components/NavBar.svelte';

	export let data;
</script>

<NavBar user={data.user} eventName={data.eventInfo.name} />

<article class="max-w-150 text-center mx-auto sm:mt-16">
	<h1>{data.eventInfo.name}</h1>

	<i class="i-carbon-hourglass block h-24 w-24 m-auto"></i>

	<p class="mt-8 text-8">Event not started yet.</p>

	<p class="text-6">
		Publish time: {data.eventInfo.publishTime.toLocaleString()}
	</p>
</article>
