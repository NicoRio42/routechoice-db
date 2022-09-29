import Runner from "../models/Runner";
import {
  CompleteRunnerLeg,
  MissingRunnerLeg,
  PartialRunnerLeg,
  RunnerLeg,
} from "../models/runner-leg";

export function isNotNullRunnerLeg(
  runnerLeg: RunnerLeg | null
): runnerLeg is RunnerLeg {
  return runnerLeg !== null;
}

export function isPartialOrCompleteRunnerLeg(
  leg: RunnerLeg
): leg is PartialRunnerLeg | CompleteRunnerLeg {
  return (leg as PartialRunnerLeg).timeOverall !== undefined;
}

export function isPartialRunnerLeg(leg: RunnerLeg): leg is PartialRunnerLeg {
  return (leg as CompleteRunnerLeg).time === undefined;
}

export function isCompleteRunnerLeg(leg: RunnerLeg): leg is CompleteRunnerLeg {
  return (leg as CompleteRunnerLeg).time !== undefined;
}

export function isRunner(runner: Runner | null): runner is Runner {
  return runner !== null;
}
