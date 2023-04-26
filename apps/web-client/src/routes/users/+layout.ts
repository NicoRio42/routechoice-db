import { createUserLoggedInPromise } from '$lib/stores/user.store.js';
import { redirect } from '@sveltejs/kit';

export async function load() {
	const isLoggedIn = await createUserLoggedInPromise();
	if (!isLoggedIn) throw redirect(307, '/login');
}
