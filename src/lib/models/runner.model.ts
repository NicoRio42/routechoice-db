import type { Runner as RunnerFromDatabase, RunnerLeg } from '../server/db/models.js';
import type { RunnerTrack } from 'orienteering-js/models';

export type RunnerWithNullableLegs = RunnerFromDatabase & {
	legs: (RunnerLeg | null)[];
};

export type RunnerWithNullableLegsAndTrack = RunnerWithNullableLegs & { track: RunnerTrack | null };

export type RunnerWithLegsAndTracks = RunnerFromDatabase & {
	track: RunnerTrack;
	legs: RunnerLeg[];
};
