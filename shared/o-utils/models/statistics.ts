import { RouteChoicesStatistic } from "./route-choices-statistics";

export default interface Statistics {
  leader: number[];
  superman: number[];
  supermanSplits: number[];
  mistakesSum: number[];
  routeChoicesStatistics: Record<string, RouteChoicesStatistic>[];
}
