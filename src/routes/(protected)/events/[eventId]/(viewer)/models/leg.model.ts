import type { Routechoice, Leg as LegFromDatabase } from '$lib/server/db/schema.js';

export type Leg = LegFromDatabase & { routechoices: Routechoice[] };
