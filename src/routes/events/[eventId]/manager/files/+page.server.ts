import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { error, redirect } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { uploadFileSchema } from './upload-file-schema.js';
import { generateId } from 'lucia';
import type { File as CloudflareFile } from '@cloudflare/workers-types';
import { db } from '$lib/server/db/db.js';
import { file as fileTable } from '$lib/server/db/schema.js';
import { R2_PUBLIC_URL } from '$lib/constants.js';
import { and, eq } from 'drizzle-orm';

export async function load({ locals, params }) {
	redirectIfNotAdmin(locals.user);
	const form = await superValidate(zod(uploadFileSchema));

	const files = await db
		.select()
		.from(fileTable)
		.where(eq(fileTable.fkEvent, params.eventId))
		.all();

	return { form, files };
}

export const actions = {
	upload: async ({ locals, request, platform, params }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const form = await superValidate(request, zod(uploadFileSchema));
		if (!form.valid) return fail(400, { form });

		const file = form.data.file as unknown as CloudflareFile;
		const id = generateId(15);
		const fileNameWithId = `${id}-${file.name}`;
		const url = `${R2_PUBLIC_URL}/${fileNameWithId}`;

		const object = await platform?.env?.R2_BUCKET.put(fileNameWithId, file);

		if (object === null || object === undefined) {
			return setError(form, '', 'An error occured while uploading the file');
		}

		try {
			await db
				.insert(fileTable)
				.values({ id, fkEvent: params.eventId, url, name: form.data.name })
				.run();
		} catch (e) {
			console.error(e);
			return setError(form, '', 'An error occured while uploading the file');
		}

		throw redirect(302, request.url);
	},
	delete: async ({ locals, request, platform, params }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();
		const fileId = formData.get('fileId');
		if (typeof fileId !== 'string') throw error(400);

		const [file] = await db
			.delete(fileTable)
			.where(and(eq(fileTable.fkEvent, params.eventId), eq(fileTable.id, fileId)))
			.returning();

		if (file === undefined) throw error(404);

		await platform?.env?.R2_BUCKET.delete(file.url.split('/').at(-1) ?? '');

		throw redirect(302, request.url);
	}
};
