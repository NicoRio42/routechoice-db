import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { parseAndInsertSplitTimesFromIofXml3File } from '../helpers.js';
import { splitTimesFromLocalFile } from './schema.js';
import { db } from '$lib/server/db/db.js';

export async function load({ locals }) {
	redirectIfNotAdmin(locals.user);

	const form = await superValidate(splitTimesFromLocalFile);
	return { form };
}

export const actions = {
	default: async ({ locals, params: { eventId }, request }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();
		const form = await superValidate(formData, splitTimesFromLocalFile);
		if (!form.valid) return fail(400, { form });

		const splitTimesFile = formData.get('file');
		if (!(splitTimesFile instanceof File)) return setError(form, 'file', 'Not a valid file');

		const splitTimesRaw = await splitTimesFile.text();

		const runnnersErrors = await parseAndInsertSplitTimesFromIofXml3File(
			splitTimesRaw,
			form.data.className,
			form.data.timezone,
			eventId,
			db
		);

		if (runnnersErrors !== undefined) {
			return setError(form, '', runnnersErrors.message);
		}

		throw redirect(302, `/events/${eventId}/manager/split-times/runners-attribution`);
	}
};
