import type { Leg as LegFromDatabase } from '../server/db/models.js';
import type { RoutechoiceWithParsedTrack, RoutechoiceWithStatistics } from './routechoice.model.js';

export type LegWithRoutechoices = LegFromDatabase & { routechoices: RoutechoiceWithStatistics[] };

export type LegWithRoutechoiceWithParsedTrack = LegFromDatabase & {
	routechoices: RoutechoiceWithParsedTrack[];
};
