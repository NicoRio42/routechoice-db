import type { Leg, Routechoice } from '../server/db/models.js';
import type { RoutechoiceWithParsedTrack } from './routechoice.model.js';

export type LegWithRoutechoices = Leg & { routechoices: Routechoice[] };

export type LegWithRoutechoiceWithParsedTrack = Leg & {
	routechoices: RoutechoiceWithParsedTrack[];
};
