import EmptyRunnerLeg from "./empty-runner-leg";

export default interface RunnerLeg extends EmptyRunnerLeg {
  timeOverall: number;
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
