<script>
	import { navigating } from '$app/stores';
	import { initializeApp } from 'firebase/app';
	import { getFirestore } from 'firebase/firestore/lite';
	import { getFunctions } from 'firebase/functions';
	import firebaseConfig from '../environments/environment';
	import NavBar from './NavBar.svelte';

	import './pico.min.css';
	import './global.css';

	const fireBaseApp = initializeApp(firebaseConfig);
	getFunctions(fireBaseApp);
	getFirestore(fireBaseApp);
</script>

<div class="wrapper">
	{#if $navigating !== null}
		<progress />
	{/if}

	<NavBar />

	<slot />
</div>

<style>
	.wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	progress {
		position: fixed;
		height: 0.25rem;
		border-radius: 0;
	}
</style>
