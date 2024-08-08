<script>
	import { page } from '$app/stores';
	import NavBar from '$lib/components/NavBar.svelte';
	import { WEBSITE_NAME } from '$lib/constants';
	import HeroSection from './HeroSection.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	export let data;
</script>

<MetaTags
	title={WEBSITE_NAME}
	description="The Sprint Orienteering Analysis platform"
	canonical={new URL($page.url.pathname, $page.url.origin).href}
	openGraph={{
		url: new URL($page.url.pathname, $page.url.origin).href,
		locale: 'en_US',
		images: [
			{ url: '/facebook.png', width: 1200, height: 630, alt: 'A LiDAR generated orienteering map' }
		]
	}}
	twitter={{ cardType: 'summary_large_image' }}
/>

<NavBar user={data.user} />

<HeroSection />
