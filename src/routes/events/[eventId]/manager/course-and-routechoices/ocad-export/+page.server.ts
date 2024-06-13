import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';
import { parseGPXRoutechoicesOCADExport, parseIOFXML3CourseExport } from '@orienteering-js/course';
import { insertControlPointsLegsAndRoutechoices } from '../helpers.js';

export async function load({ locals }) {
	redirectIfNotAdmin(locals.user);
}

export const actions = {
	default: async ({ locals, request, params: { eventId } }) => {
		if (locals.user === null) throw error(401);
		if (locals.user.role !== 'admin') throw error(403);

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

		const [controls, legs] = parseIOFXML3CourseExport(courseDoc as any as XMLDocument, classIndex);

		const routechoicesRaw = await routechoicesFile.text();
		const routechoicesDoc = parser.parseFromString(routechoicesRaw, 'text/xml');

		const legsWithRoutechoices = parseGPXRoutechoicesOCADExport(
			routechoicesDoc as any as XMLDocument,
			legs
		);

		await insertControlPointsLegsAndRoutechoices(controls, legsWithRoutechoices, db, eventId);

		throw redirect(302, `/events/${eventId}/manager`);
	}
};
