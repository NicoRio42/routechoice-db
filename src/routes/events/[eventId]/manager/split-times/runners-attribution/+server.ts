import { db } from '$lib/server/db/db.js';
import { runnerLeg as runnerLegTable, runner as runnerTable } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { z } from 'zod';

const runnerWithLegsSchema = z.object({
	id: z.string(),
	fkLiveEvent: z.string().nullable(),
	trackingDeviceId: z.string().nullable(),
	fkUser: z.string().nullable(),
	legs: z.array(
		z.object({
			id: z.string(),
			fkDetectedRoutechoice: z.string().nullable()
		})
	)
});

export async function POST({ request, locals }) {
	if (locals.user === null) {
		return new Response('Unauthenticated', { status: 401 });
	}

	if (locals.user.role !== 'admin') {
		return new Response('Unauthorized', { status: 403 });
	}

	const runners = z.array(runnerWithLegsSchema).safeParse(await request.json());

	if (runners.error) {
		return new Response('Bad request', { status: 400 });
	}

	const statements: BatchItem<'sqlite'>[] = [];

	for (const runner of runners.data) {
		const runnerUpdate = db
			.update(runnerTable)
			.set({
				fkLiveEvent: runner.fkLiveEvent,
				trackingDeviceId: runner.trackingDeviceId,
				fkUser: runner.fkUser
			})
			.where(eq(runnerTable.id, runner.id));

		statements.push(runnerUpdate);

		for (const runnerLeg of runner.legs) {
			if (runnerLeg === null || !runnerLeg.fkDetectedRoutechoice) continue;

			const runnerLegUpdate = db
				.update(runnerLegTable)
				.set({ fkDetectedRoutechoice: runnerLeg.fkDetectedRoutechoice })
				.where(eq(runnerLegTable.id, runnerLeg.id));

			statements.push(runnerLegUpdate);
		}
	}

	const firstStatement = statements.shift();

	if (firstStatement === undefined) {
		return new Response('There should be at least one runner', { status: 400 });
	}

	try {
		await db.batch([firstStatement, ...statements]);
	} catch {
		return new Response(null, { status: 500 });
	}

	return new Response(null, { status: 200 });
}
