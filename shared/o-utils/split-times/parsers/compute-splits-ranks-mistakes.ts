import type Runner from "../../models/Runner";
import computeRunnersMistakes from "../utils/compute-mistakes";
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

  const runnersWithMistakes = computeRunnersMistakes(overallSplitRankedRunners);

  console.log(runnersWithMistakes.at(-1)?.legs);
  return runnersWithMistakes;
}
