import type { Leg } from "./leg";

export interface Runner {
  id: number;
  course: number[];
  status: string;
  firstName: string;
  lastName: string;
  startTime: string;
  time: number;
  legs: Leg[];
  timeBehindSupermanGraphData: { x: number; y: number }[];
  timeBehindLeaderGraphData: { x: number; y: number }[];
  isComplete?: boolean;
  rank?: number;
  timeBehind?: number;
  totalTimeLost?: number;
  rerun2dRouteIndex?: number;
}
