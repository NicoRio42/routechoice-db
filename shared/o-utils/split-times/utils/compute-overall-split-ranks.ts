import Runner from "../../models/Runner";
import { isCompleteRunnerLeg } from "../../type-guards/runner-guards";
import { computeRanksplit } from "./compute-split-ranks-time-behind";
import sortRunners, { RunnerForSort } from "./sort-runners";

export function computeOverallSplitRanks(runners: Runner[]): Runner[] {
  const clonedRunners = structuredClone(runners);
  const course = clonedRunners[0].legs.map((leg) => leg.controlCode);

  // For every legs of every runners calculate ranking and time behind
  course.forEach((leg, index) => {
    // Make an array with splits and id for one leg
    const legSplits: RunnerForSort[] = clonedRunners.map((runner) => {
      const lg = runner.legs.find((l) => l.controlCode === leg);

      if (lg === undefined) {
        throw new Error(
          `Cannot find leg ${leg} in ${runner.firstName} ${runner.lastName}'s legs.`
        );
      }

      const time = isCompleteRunnerLeg(lg) ? lg.timeOverall : null;
      return { id: runner.id, time, rankSplit: 0 };
    });

    legSplits.sort(sortRunners);

    legSplits.forEach((legSplit, i) => {
      legSplit.rankSplit =
        i === 0 ? i + 1 : computeRanksplit(legSplit, legSplits[i - 1], i);

      const runner = clonedRunners.find((r) => legSplit.id === r.id);

      if (runner === undefined) {
        throw new Error("Can't find back the runner");
      }

      const runnerLeg = runner.legs[index];

      if (!isCompleteRunnerLeg(runnerLeg)) {
        return;
      }

      runnerLeg.rankOverall = legSplit.rankSplit;
      const legOverallBestTime = legSplits[0];

      if (legOverallBestTime.time === null) {
        throw new Error("First Runner should have a split for every legs.");
      }

      runnerLeg.timeBehindOverall =
        runnerLeg.timeOverall - legOverallBestTime.time;
    });
  });

  return clonedRunners;
}
