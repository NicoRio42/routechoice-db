import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { event as eventDb } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals, params: { eventId } }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const event = await locals.db.select().from(eventDb).where(eq(eventDb.id, eventId)).get();

	return { event };
}
