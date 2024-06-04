import type { Routechoice, RoutechoiceStatistics } from '$lib/server/db/models.js';

export type RoutechoiceWithStatistics = Routechoice & { statistics: RoutechoiceStatistics };

export type RoutechoiceWithParsedTrack = Omit<Routechoice, 'latitudes' | 'longitudes' | 'fkLeg'> & {
	track: [number, number][];
};
