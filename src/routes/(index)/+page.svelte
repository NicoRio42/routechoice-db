<script>
	import NavBar from '$lib/components/NavBar.svelte';
	import HeroSection from './HeroSection.svelte';

	export let data;
</script>

<NavBar user={data.user} />

<HeroSection />
