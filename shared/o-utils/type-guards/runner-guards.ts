import EmptyRunnerLeg from "../models/empty-runner-leg";
import Runner from "../models/Runner";
import RunnerLeg from "../models/runner-leg";

export function isRunnerLegOrEmpltyRunnerLeg(
  runnerLeg: RunnerLeg | EmptyRunnerLeg | null
): runnerLeg is RunnerLeg | EmptyRunnerLeg {
  return runnerLeg !== null;
}

export function isRunner(runner: Runner | null): runner is Runner {
  return runner !== null;
}

export function isRunnerLeg(
  runnerLeg: RunnerLeg | EmptyRunnerLeg
): runnerLeg is RunnerLeg {
  return (runnerLeg as RunnerLeg).time !== undefined;
}
