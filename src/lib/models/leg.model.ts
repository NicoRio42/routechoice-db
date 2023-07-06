import type { Routechoice, Leg as LegFromDatabase } from '$lib/server/db/schema.js';
import type { RoutechoiceWithParsedTrack } from './routechoice.model.js';

export type LegWithRoutechoices = LegFromDatabase & { routechoices: Routechoice[] };

export type LegWithRoutechoiceWithParsedTrack = LegFromDatabase & {
	routechoices: RoutechoiceWithParsedTrack[];
};
