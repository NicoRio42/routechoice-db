import { RouteChoicesStatistic } from "./route-choices-statistics";
import { Runner } from "./runner";

export interface Course {
  splitsXmlDoc: XMLDocument;
  className: string;
  mistakeDetectionRatio: number;
  timeZone: string;
  timeOffset: number;
  date: Date;
  course: number[];
  runners: Runner[];
  leader: number[];
  superman: number[];
  supermanSplits: number[];
  mistakesSum: number[];
  routeChoicesStatistics: Record<string, RouteChoicesStatistic>[];
}

const doc = new XMLDocument();
const date = new Date();
