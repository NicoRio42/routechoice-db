<script>
	import NavBar from './NavBar.svelte';
	import { initializeApp } from 'firebase/app';
	import { getFunctions } from 'firebase/functions';
	import { getFirestore } from 'firebase/firestore/lite';
	import { getAuth, onAuthStateChanged } from 'firebase/auth';
	import firebaseConfig from '../environments/environment';
	import './global.css';
	import userStore from '$lib/stores/user.store';

	const fireBaseApp = initializeApp(firebaseConfig);
	getFunctions(fireBaseApp);
	getFirestore(fireBaseApp);
	const auth = getAuth(fireBaseApp);

	onAuthStateChanged(auth, (user) => {
		userStore.set(user);
	});
</script>

<div class="wrapper">
	<NavBar />

	<slot />
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
</style>
