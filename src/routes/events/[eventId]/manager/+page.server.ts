import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { event as eventTable, file as fileTable } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals, params: { eventId } }) {
	redirectIfNotAdmin(locals.user);

	return { user: locals.user };
}

export const actions = {
	deleteEvent: async ({ locals, request, platform }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();
		const eventId = formData.get('eventId');
		if (typeof eventId !== 'string') throw error(400);

		const filesToDelete = await db
			.select()
			.from(fileTable)
			.where(eq(fileTable.fkEvent, eventId))
			.all();

		await db.delete(eventTable).where(eq(eventTable.id, eventId)).run();

		if (filesToDelete.length !== 0) {
			await platform?.env?.R2_BUCKET.delete(
				filesToDelete.map((f) => f.url.split('/').at(-1) ?? '').filter((n) => n !== '')
			);
		}

		throw redirect(302, '/events');
	}
};
