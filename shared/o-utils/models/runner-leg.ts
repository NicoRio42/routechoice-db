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
