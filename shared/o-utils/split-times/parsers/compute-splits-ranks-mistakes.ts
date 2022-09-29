import Runner from "../../models/Runner";
import { computeOverallSplitRanks } from "../utils/compute-overall-split-ranks";
import computeRunnersRanks from "../utils/compute-ranks";
import { computeSplitRanksAndTimeBehind } from "../utils/compute-split-ranks-time-behind";
import computeRunnersSplitTimes from "../utils/compute-split-times";

export default function computeSplitsRanksMistakes(
  runners: Runner[]
): Runner[] {
  const rankedRunners = computeRunnersRanks(runners);
  const runnersWithSplitTimes = computeRunnersSplitTimes(rankedRunners);

  const splitRankedRunners = computeSplitRanksAndTimeBehind(
    runnersWithSplitTimes
  );

  const overallSplitRankedRunners =
    computeOverallSplitRanks(splitRankedRunners);

  //   const runnersWithMistakes = computeRunnersMistakes(overallSplitRankedRunners);

  //   return runnersWithMistakes;

  return overallSplitRankedRunners;
}
