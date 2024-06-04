import type { Routechoice } from '$lib/server/db/models.js';

export type RoutechoiceWithParsedTrack = Omit<Routechoice, 'latitudes' | 'longitudes' | 'fkLeg'> & {
	track: [number, number][];
};
