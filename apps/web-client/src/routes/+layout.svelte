<script>
	import { navigating } from '$app/stores';
	import { initializeApp } from 'firebase/app';
	import { getFirestore } from 'firebase/firestore/lite';
	import { getFunctions } from 'firebase/functions';
	import firebaseConfig from '../environments/environment';
	import './global.css';
	import NavBar from './NavBar.svelte';

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
		position: absolute;
		height: 0.25rem;
		border-radius: 0;
	}
</style>
