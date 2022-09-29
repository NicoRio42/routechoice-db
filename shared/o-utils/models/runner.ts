import EmptyRunnerLeg from "./empty-runner-leg";
import RunnerStatusEnum from "./enums/runner-status-enum";
import RunnerLeg from "./runner-leg";

export default interface Runner {
  id: number;
  foreignKeys: Record<string, unknown>;
  status: RunnerStatusEnum;
  firstName: string;
  lastName: string;
  startTime: number;
  time: number | null;
  legs: (RunnerLeg | EmptyRunnerLeg)[];
  rank: number | null;
  timeBehind: number | null;
  totalTimeLost: number;
}
