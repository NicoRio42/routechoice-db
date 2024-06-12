<script>
	import NavBar from '$lib/components/NavBar.svelte';

	export let data;
</script>

<NavBar user={data.user} />

<main class="max-w-100 mx-auto mt-10">
	<h1>Bug report</h1>

	<p>
		If you experience any problem, please send an email to <a href="mailto:nicolas.rio42@gmail.com"
			>Nicolas Rio</a
		> (nicolas.rio42@gmail.com). Attach screenshots if needed.
	</p>
</main>
