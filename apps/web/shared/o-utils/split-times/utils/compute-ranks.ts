import type Runner from "../../models/Runner";
import sortRunners from "./sort-runners";

export default function computeRunnersRanks(runners: Runner[]): Runner[] {
  const clonedRunners = structuredClone(runners).sort(sortRunners);
  const bestTime = clonedRunners[0].time;

  clonedRunners.forEach((runner, index) => {
    if (runner.time === null) {
      runner.rank = null;
      runner.timeBehind = null;
      return;
    }

    if (index === 0) {
      runner.rank = 1;
      runner.timeBehind = 0;
      return;
    }

    runner.rank =
      runner.time === clonedRunners[index - 1].time
        ? clonedRunners[index - 1].rank
        : index + 1;

    runner.timeBehind = bestTime !== null ? runner.time - bestTime : null;
  });

  return clonedRunners;
}
