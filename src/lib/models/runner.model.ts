import type { Runner as RunnerFromDatabase, RunnerLeg } from '../server/db/schema.js';
import type { RunnerTrack } from 'orienteering-js/models';

export type RunnerWithNullableLegs = RunnerFromDatabase & {
	legs: (RunnerLeg | null)[];
};

export type RunnerWithNullableLegsAndTrack = RunnerWithNullableLegs & { track: RunnerTrack | null };
