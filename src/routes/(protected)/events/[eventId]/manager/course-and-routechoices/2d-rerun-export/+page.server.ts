import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { getCoordinatesConverterFromTwoDRerunCourseExport } from '$lib/two-d-rerun.js';
import { fail, redirect } from '@sveltejs/kit';
import { twoDRerunCourseExportSchema } from 'orienteering-js/models';
import { parseTwoDRerunCourseAndRoutechoicesExport } from 'orienteering-js/two-d-rerun';
import { insertControlPointsLegsRoutechoicesAndRoutechoicesStatistics } from '../helpers.js';
import { reThrowRedirectsAndErrors } from '$lib/server/sveltekit-helpers.js';

export function load() {
	return { displayError: false };
}

export const actions = {
	default: async ({ request, locals, params: { eventId } }) => {
		try {
			const session = await locals.authRequest.validate();
			if (!session) throw redirect(302, '/login');
			const { user } = session;

			redirectIfNotAdmin(user);

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

			await insertControlPointsLegsRoutechoicesAndRoutechoicesStatistics(
				controls,
				legs,
				locals.db,
				eventId
			);

			throw redirect(302, `/events/${eventId}/manager/split-times`);
		} catch (e) {
			reThrowRedirectsAndErrors(e);

			console.error(e);
			return { displayError: true };
		}
	}
};
