import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';

export async function load({ locals, params: { eventId } }) {
	redirectIfNotAdmin(locals.user);

	return { user: locals.user };
}
