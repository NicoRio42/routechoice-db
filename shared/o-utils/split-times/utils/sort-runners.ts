import type Runner from "../../models/Runner";

export default function sortRunners(
  runnerA: Runner | RunnerForSort,
  runnerB: Runner | RunnerForSort
): number {
  if (runnerA.time !== null && runnerB.time !== null) {
    return runnerA.time - runnerB.time;
  }

  if (runnerA.time === null && runnerB.time !== null) {
    return 1;
  }

  if (runnerA.time !== null && runnerB.time === null) {
    return -1;
  }

  return 0;
}

export interface RunnerForSort {
  id: number;
  time: number | null;
  rankSplit: number;
}
