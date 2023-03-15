<script lang="ts">
	import { fade } from 'svelte/transition';

	export let pageTitle: string;
	export let title: string;
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<main class="container" in:fade={{ duration: 500 }}>
	<article>
		<h1>{title}</h1>

		<slot />
	</article>
</main>

<style>
	main {
		padding-bottom: 0;
		height: 100%;
	}

	article {
		margin: 5rem auto;
		padding: 1rem;
		width: 20rem;
	}

	h1 {
		margin-bottom: 1rem;
	}

	@media screen and (max-width: 500px) {
		article {
			width: 100%;
			margin-top: 1rem;
		}
	}
</style>
