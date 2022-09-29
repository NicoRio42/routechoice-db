import Leg from "./leg";
import CourseMap from "./course-map";
import Runner from "./runner";
import Statistics from "./statistics";

export default interface OrienteeringEvent {
  course: Leg[];
  runners: Runner[];
  map: CourseMap;

  date: Date;
  timeOffset: number;

  statistics: Statistics;
}
