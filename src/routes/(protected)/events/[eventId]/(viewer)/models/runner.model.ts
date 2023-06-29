import type { Runner as RunnerFromDatabase, RunnerLeg } from '$lib/server/db/schema.js';
import type { RunnerTrack } from 'orienteering-js/models';

export type Runner = RunnerFromDatabase & { legs: (RunnerLeg | null)[]; track: RunnerTrack };
