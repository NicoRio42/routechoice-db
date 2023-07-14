import { superValidate } from 'sveltekit-superforms/server';
import { newRoutechoiceSchema } from './schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { transform } from 'ol/proj.js';
import { getLineStringLength } from 'orienteering-js/utils';
import { routechoice as routechoiceFromDatabase } from '$lib/server/db/schema.js';

export const actions = {
	add: async ({ request, params: { eventId, legId }, locals }) => {
		const { user } = await locals.authRequest.validateUser();

		if (!user || user.role !== RolesEnum.Enum.admin) {
			return fail(403);
		}

		const form = await superValidate(request, newRoutechoiceSchema);
		if (!form.valid) return fail(400, { form });

		const webMercatorCoordinates = form.data.track.map((point) =>
			transform(point, 'EPSG:3857', 'EPSG:4326')
		);

		const latitudes = webMercatorCoordinates.map((pt) => pt[1]).join(';');
		const longitudes = webMercatorCoordinates.map((pt) => pt[0]).join(';');

		const length = getLineStringLength(webMercatorCoordinates as [number, number][]);

		await locals.db
			.insert(routechoiceFromDatabase)
			.values({
				color: form.data.color,
				id: crypto.randomUUID(),
				length,
				name: form.data.name,
				fkLeg: legId,
				latitudes,
				longitudes
			})
			.run();

		throw redirect(302, `/events/${eventId}`);
	}
};
