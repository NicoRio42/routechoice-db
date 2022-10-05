import type Leg from "./leg";
import type CourseMap from "./course-map";
import type Runner from "./runner";
import type Statistics from "./statistics";

export default interface OrienteeringEvent {
  course: Leg[];
  runners: Runner[];
  map: CourseMap;

  date: Date;
  timeOffset: number;

  statistics: Statistics;
}
