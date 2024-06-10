import { db } from '$lib/server/db/db.js';
import {
	routechoice as routechoiceTable,
	runnerLeg as runnerLegTable
} from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { newRoutechoiceSchema } from './new-routechoice-schema.js';

export async function POST({ request, locals }) {
	if (locals.user === null) return new Response(null, { status: 401 });
	if (locals.user.role !== 'admin') return new Response(null, { status: 403 });

	const newRoutechoice = newRoutechoiceSchema.safeParse(await request.json());
	if (newRoutechoice.error !== undefined) return new Response(null, { status: 400 });

	await db.batch([
		db.insert(routechoiceTable).values({
			id: newRoutechoice.data.id,
			color: newRoutechoice.data.color,
			length: newRoutechoice.data.length,
			name: newRoutechoice.data.name,
			fkLeg: newRoutechoice.data.fkLeg,
			latitudes: newRoutechoice.data.latitudes,
			longitudes: newRoutechoice.data.longitudes
		}),
		...newRoutechoice.data.runnerLegsToUpdate.map(({ id, fkDetectedRoutechoice }) =>
			db.update(runnerLegTable).set({ fkDetectedRoutechoice }).where(eq(runnerLegTable.id, id))
		)
	]);

	return new Response(null, { status: 202 });
}
