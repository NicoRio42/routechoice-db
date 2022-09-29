import Runner from "../../models/Runner";
import {
  CompleteRunnerLeg,
  MissingRunnerLeg,
  PartialRunnerLeg,
} from "../../models/runner-leg";
import {
  isPartialOrCompleteRunnerLeg,
  isPartialRunnerLeg,
} from "../../type-guards/runner-guards";

export default function computeRunnersSplitTimes(runners: Runner[]): Runner[] {
  const clonedRunners = structuredClone(runners);

  clonedRunners.forEach((runner) => {
    runner.legs = runner.legs.map((leg, index) => {
      if (!isPartialOrCompleteRunnerLeg(leg)) {
        return leg;
      }

      if (index === 0) {
        return {
          ...EMPTY_COMPLETE_RUNNER_LEG,
          controlCode: leg.controlCode,
          timeOverall: leg.timeOverall,
          time: leg.timeOverall,
        };
      }

      const previousLeg = runner.legs[index - 1];

      if (!isPartialOrCompleteRunnerLeg(previousLeg)) {
        return leg;
      }

      return {
        ...EMPTY_COMPLETE_RUNNER_LEG,
        controlCode: leg.controlCode,
        timeOverall: leg.timeOverall,
        time: leg.timeOverall - previousLeg.timeOverall,
      };
    });
  });

  return clonedRunners;
}

const EMPTY_COMPLETE_RUNNER_LEG: CompleteRunnerLeg = {
  controlCode: 0,
  timeOverall: 0,
  time: 0,
  rankSplit: 0,
  timeBehindSplit: 0,
  rankOverall: 0,
  timeBehindOverall: 0,
  timeBehindSuperman: 0,
  isMistake: false,
  timeLoss: 0,
  routeChoiceTimeLoss: null,
  detectedRouteChoice: null,
  manualRouteChoice: null,
};
