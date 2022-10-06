import type Runner from "../../models/Runner";
import type { RunnerLeg } from "../../models/runner-leg";
import SupermanSplit from "../../models/superman";
import { isCompleteRunnerLeg } from "../../type-guards/runner-guards";
import { arrayAverage } from "./shared";

export default function computeRunnersMistakes(
  runners: Runner[],
  supermanSplits: SupermanSplit[],
  mistakeDetectionRatio = 1.2
): Runner[] {
  const clonedRunners = structuredClone(runners);

  clonedRunners.forEach((runner) => {
    const percentagesBehindSuperman = runner.legs.map((leg, legIndex) => {
      if (!isCompleteRunnerLeg(leg)) {
        return null;
      }

      return leg.time / supermanSplits[legIndex].time;
    });

    const averagePercentage = arrayAverage(percentagesBehindSuperman);

    const clearedPercentageBehindSuperman =
      clearPercentageBehindAndComputeIsMistake(
        percentagesBehindSuperman,
        runner,
        averagePercentage,
        mistakeDetectionRatio
      );

    // Recalculate average without mistakes
    const clearedAveragePercentage = arrayAverage(
      clearedPercentageBehindSuperman
    );

    const newClearedPercentagesBehindSuperman =
      clearPercentageBehindAndComputeIsMistake(
        percentagesBehindSuperman,
        runner,
        clearedAveragePercentage,
        mistakeDetectionRatio
      );

    // Recalculate average without mistakes
    const newClearedAveragePercentage = arrayAverage(
      newClearedPercentagesBehindSuperman
    );

    runner.totalTimeLost = runner.legs.reduce(
      (timeLost: number, leg: RunnerLeg, legIndex: number) => {
        if (!isCompleteRunnerLeg(leg) || !leg.isMistake) {
          return 0;
        }

        const timeWithoutMistake = Math.round(
          // First runner is supposed to have only complete legs
          supermanSplits[legIndex].time * newClearedAveragePercentage
        );

        leg.timeLoss = leg.time - timeWithoutMistake;

        return timeLost + leg.timeLoss;
      },
      0
    );
  });

  return clonedRunners;
}

function clearPercentageBehindAndComputeIsMistake(
  percentagesBehindSuperman: (number | null)[],
  runner: Runner,
  averagePercentage: number,
  mistakeDetectionRatio: number
) {
  return percentagesBehindSuperman.map((percentage, legIndex) => {
    const leg = runner.legs[legIndex];

    if (!isCompleteRunnerLeg(leg) || percentage === null) {
      return null;
    }

    leg.isMistake = percentage > averagePercentage * mistakeDetectionRatio;

    return leg.isMistake ? null : percentage;
  });
}
