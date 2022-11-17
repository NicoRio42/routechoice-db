import { z } from "zod";
import RunnerStatusEnum, {
  runnerStatusEnumValidator,
} from "./enums/runner-status-enum";
import { runnerLegValidator } from "./runner-leg";
import type { RunnerLeg } from "./runner-leg";

export const runnerTrackValidator = z.object({
  lats: z.array(z.number()),
  lons: z.array(z.number()),
  times: z.array(z.number()),
});

export interface RunnerTrack {
  lats: number[];
  lons: number[];
  times: number[];
}

export default interface Runner {
  id: string;
  foreignKeys: Record<string, unknown>;
  status: RunnerStatusEnum;
  firstName: string;
  lastName: string;
  startTime: number;
  time: number | null;
  legs: (RunnerLeg | null)[];
  rank: number | null;
  timeBehind: number | null;
  totalTimeLost: number;
  track: RunnerTrack | null;
}

export const runnerValidator = z.object({
  id: z.string(),
  foreignKeys: z.record(z.unknown()),
  status: runnerStatusEnumValidator,
  firstName: z.string(),
  lastName: z.string(),
  startTime: z.number(),
  time: z.nullable(z.number()),
  legs: z.array(z.nullable(runnerLegValidator)),
  rank: z.nullable(z.number()),
  timeBehind: z.nullable(z.number()),
  totalTimeLost: z.number(),
  track: z.nullable(runnerTrackValidator),
});
