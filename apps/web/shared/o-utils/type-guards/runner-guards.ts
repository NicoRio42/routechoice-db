import type Runner from "../models/Runner";
import type { RunnerLeg } from "../models/runner-leg";

export function isRunner(runner: Runner | null): runner is Runner {
  return runner !== null;
}

export function isNotNullRunnerLeg(
  runnerLeg: RunnerLeg | null
): runnerLeg is RunnerLeg {
  return runnerLeg !== null;
}
