import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { fail, redirect } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';
import { parseGPXRoutechoicesOCADExport, parseIOFXML3CourseOCADExport } from 'orienteering-js/ocad';
import { insertControlPointsLegsRoutechoicesAndRoutechoicesStatistics } from '../helpers.js';

export const actions = {
	default: async ({ locals, request, params: { eventId } }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const formData = await request.formData();

		const courseFile = formData.get('courseFile');
		if (!(courseFile instanceof File)) return fail(400);

		const classIndexStr = formData.get('classIndex');
		if (classIndexStr === null) return fail(400);
		const classIndex = parseInt(classIndexStr.toString(), 10);
		if (isNaN(classIndex)) return fail(400);

		const routechoicesFile = formData.get('routechoicesFile');
		if (!(routechoicesFile instanceof File)) return fail(400);

		const courseRaw = await courseFile.text();
		const parser = new DOMParser();
		const courseDoc = parser.parseFromString(courseRaw, 'text/xml');

		const [controls, legs] = parseIOFXML3CourseOCADExport(
			courseDoc as any as XMLDocument,
			classIndex
		);

		const routechoicesRaw = await routechoicesFile.text();
		const routechoicesDoc = parser.parseFromString(routechoicesRaw, 'text/xml');

		const legsWithRoutechoices = parseGPXRoutechoicesOCADExport(
			routechoicesDoc as any as XMLDocument,
			legs
		);

		await insertControlPointsLegsRoutechoicesAndRoutechoicesStatistics(
			controls,
			legsWithRoutechoices,
			locals.db,
			eventId
		);

		throw redirect(302, `/events/${eventId}/manager/split-times`);
	}
};
