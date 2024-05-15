import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { reThrowRedirectsAndErrors } from '$lib/server/sveltekit-helpers.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { parseAndInsertSplitTimesFromIofXml3File } from '../helpers.js';
import { splitTimesFromWinsplitsSchema } from './schema.js';

export async function load({ locals }) {
	redirectIfNotAdmin(locals.user);

	const form = await superValidate(zod(splitTimesFromWinsplitsSchema));
	return { form };
}

export const actions = {
	default: async ({ locals, request, params: { eventId } }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		const formData = await request.formData();
		const form = await superValidate(formData, zod(splitTimesFromWinsplitsSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const response = await fetch(
				`${TWO_D_RERUN_URL}?id=${form.data.eventId}&classid=${form.data.classId}`
			);

			const splitTimesRaw = await response.text();

			await parseAndInsertSplitTimesFromIofXml3File(
				splitTimesRaw,
				form.data.classId,
				form.data.timezone,
				eventId,
				db
			);

			throw redirect(302, `/events/${eventId}/manager/split-times/runners-attribution`);
		} catch (e) {
			reThrowRedirectsAndErrors(e);
			console.error(e);
			return setError(form, '', `Problem with split times parsing: ${e}`);
		}
	}
};
