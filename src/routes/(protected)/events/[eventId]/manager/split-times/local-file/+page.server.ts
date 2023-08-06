import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import {
	controlPoint,
	leg,
	runnerLeg as runnerLegTable,
	runner as runnerTable
} from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, or } from 'drizzle-orm';
import { DOMParser } from 'linkedom';
import type { Runner } from 'orienteering-js/models';
import { parseIOFXML3SplitTimesFile } from 'orienteering-js/split-times';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { splitTimesFromLocalFile } from './schema.js';
import { parseAndInsertSplitTimesFromIofXml3File } from '../helpers.js';
import { reThrowRedirectsAndErrors } from '$lib/server/sveltekit-helpers.js';

export async function load({ locals }) {
	const session = await locals.authRequest.validate();
	if (!session) throw redirect(302, '/login');
	const { user } = session;

	redirectIfNotAdmin(user);

	const form = await superValidate(splitTimesFromLocalFile);
	return { form };
}

export const actions = {
	default: async ({ locals, params: { eventId }, request }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const formData = await request.formData();
		const form = await superValidate(formData, splitTimesFromLocalFile);
		if (!form.valid) return fail(400, { form });

		const splitTimesFile = formData.get('file');
		if (!(splitTimesFile instanceof File)) return setError(form, 'file', 'Not a valid file');

		const splitTimesRaw = await splitTimesFile.text();

		try {
			await parseAndInsertSplitTimesFromIofXml3File(
				splitTimesRaw, form.data.className, form.data.timezone, eventId, locals.db
			);

			throw redirect(302, `/events/${eventId}/manager/split-times/runners-attribution`);
		} catch (e) {
			reThrowRedirectsAndErrors(e)
			console.error(e)
			return setError(form, null, `Problem with split times parsing: ${e}`);
		}
	}
};
