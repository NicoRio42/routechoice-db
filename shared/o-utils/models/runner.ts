import type RunnerStatusEnum from "./enums/runner-status-enum";
import type { RunnerLeg } from "./runner-leg";

export default interface Runner {
  id: number;
  foreignKeys: Record<string, unknown>;
  status: RunnerStatusEnum;
  firstName: string;
  lastName: string;
  startTime: number;
  time: number | null;
  legs: RunnerLeg[];
  rank: number | null;
  timeBehind: number | null;
  totalTimeLost: number;
}
