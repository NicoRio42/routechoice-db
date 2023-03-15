import { browser } from '$app/environment';
import userStore from '$lib/stores/user.store';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../environments/environment';

export const ssr = false;

const fireBaseApp = initializeApp(firebaseConfig);
const auth = getAuth(fireBaseApp);

export const load = async (toto) => {
	if (!browser) return;

	onAuthStateChanged(auth, (user) => userStore.set(user));
};
