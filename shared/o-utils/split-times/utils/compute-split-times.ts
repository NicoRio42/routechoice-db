import Runner from "../../models/Runner";
import { isRunnerLeg } from "../../type-guards/runner-guards";

export default function computeRunnersSplitTimes(runners: Runner[]): Runner[] {
  const clonedRunners = structuredClone(runners);

  //   clonedRunners.forEach((runner) => {
  //     runner.legs.forEach((leg, index) => {
  //       if (!isRunnerLeg(leg)) {
  //         return;
  //       }

  //       if (index === 0) {
  //         if (leg.timeOverall === null) {
  //           leg.time = null;
  //         } else {
  //           leg.time = leg.timeOverall;
  //         }
  //       } else {
  //         if (leg.timeOverall === null) {
  //           leg.time = null;
  //         } else if (runner.legs[index - 1].timeOverall === null) {
  //           leg.time = null;
  //         } else {
  //           leg.time = leg.timeOverall - runner.legs[index - 1].timeOverall;
  //         }
  //       }
  //     });
  //   });

  return clonedRunners;
}
