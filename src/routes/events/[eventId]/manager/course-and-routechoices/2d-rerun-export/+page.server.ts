import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { reThrowRedirectsAndErrors } from '$lib/server/sveltekit-helpers.js';
import { error, fail, redirect } from '@sveltejs/kit';
import {
	twoDRerunCourseExportSchema,
	getCoordinatesConverterFromTwoDRerunCourseExport,
	parseTwoDRerunCourseAndRoutechoicesExport
} from '@orienteering-js/course';
import { insertControlPointsLegsAndRoutechoices } from '../helpers.js';

export async function load({ locals }) {
	redirectIfNotAdmin(locals.user);

	return { displayError: false };
}

export const actions = {
	default: async ({ request, locals, params: { eventId } }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

		try {
			const formData = await request.formData();
			const file = formData.get('twoDRerunExport');

			if (!(file instanceof File)) throw fail(400);

			const twoDRerunExport = twoDRerunCourseExportSchema.parse(JSON.parse(await file.text()));

			const coordinatesConverter =
				getCoordinatesConverterFromTwoDRerunCourseExport(twoDRerunExport);

			const [controls, legs] = parseTwoDRerunCourseAndRoutechoicesExport(
				twoDRerunExport,
				coordinatesConverter
			);

			await insertControlPointsLegsAndRoutechoices(controls, legs, db, eventId);

			throw redirect(302, `/events/${eventId}/manager/split-times`);
		} catch (e) {
			reThrowRedirectsAndErrors(e);

			console.error(e);
			return { displayError: true };
		}
	}
};
