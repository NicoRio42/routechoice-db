import { z } from "zod";

export const missingRunnerLegValidator = z.object({
  controlCode: z.number(),
});

export const partialRunnerLegValidator = missingRunnerLegValidator.extend({
  timeOverall: z.number(),
});

export const completeRunnerLegValidator = partialRunnerLegValidator.extend({
  time: z.number(),
  rankSplit: z.number(),
  timeBehindSplit: z.number(),
  rankOverall: z.number(),
  timeBehindOverall: z.number(),
  timeBehindSuperman: z.number(),
  isMistake: z.boolean(),
  timeLoss: z.number(),
  routeChoiceTimeLoss: z.nullable(z.number()),
  detectedRouteChoice: z.nullable(z.number()),
  manualRouteChoice: z.nullable(z.number()),
});

export const runnerLegValidator = z.union([
  missingRunnerLegValidator,
  partialRunnerLegValidator,
  completeRunnerLegValidator,
]);

export interface MissingRunnerLeg {
  controlCode: number;
}

export interface PartialRunnerLeg extends MissingRunnerLeg {
  timeOverall: number;
}

export interface CompleteRunnerLeg extends PartialRunnerLeg {
  time: number;
  rankSplit: number;
  timeBehindSplit: number;
  rankOverall: number;
  timeBehindOverall: number;
  timeBehindSuperman: number;
  isMistake: boolean;
  timeLoss: number;
  routeChoiceTimeLoss: number | null;
  detectedRouteChoice: number | null;
  manualRouteChoice: number | null;
}

type RunnerLeg = MissingRunnerLeg | PartialRunnerLeg | CompleteRunnerLeg;

export type { RunnerLeg };
