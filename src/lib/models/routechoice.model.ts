import type { Routechoice, RoutechoiceStatistics } from '$lib/server/db/schema.js';

export type RoutechoiceWithStatistics = Routechoice & { statistics: RoutechoiceStatistics };

export type RoutechoiceWithParsedTrack = Omit<Routechoice, 'latitudes' | 'longitudes' | 'fkLeg'> & {
	track: [number, number][];
};
