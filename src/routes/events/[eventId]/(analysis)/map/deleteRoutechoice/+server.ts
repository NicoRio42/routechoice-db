import { db } from '$lib/server/db/db.js';
import {
	routechoice as routechoiceTable,
	runnerLeg as runnerLegTable
} from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { deleteRoutechoiceSchema } from './delete-routechoice-schema.js';

export async function POST({ locals, request }) {
	if (locals.user === null) return new Response(null, { status: 401 });
	if (locals.user.role !== 'admin') return new Response(null, { status: 403 });

	const routechoiceToDelete = deleteRoutechoiceSchema.safeParse(await request.json());
	if (routechoiceToDelete.error !== undefined) return new Response(null, { status: 400 });

	await db.batch([
		db
			.delete(routechoiceTable)
			.where(eq(routechoiceTable.id, routechoiceToDelete.data.routechoiceId)),
		...routechoiceToDelete.data.runnerLegsToUpdate.map(({ id, fkDetectedRoutechoice }) =>
			db.update(runnerLegTable).set({ fkDetectedRoutechoice }).where(eq(runnerLegTable.id, id))
		)
	]);

	return new Response(null, { status: 202 });
}
