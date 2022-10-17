import { z } from "zod";
import CourseMap, { courseMapValidator } from "./course-map";
import { legValidator } from "./leg";
import type Leg from "./leg";
import { runnerValidator } from "./runner";
import type Runner from "./runner";
import { statisticsValidator } from "./statistics";
import type Statistics from "./statistics";

export const courseDataValidator = z.object({
  course: z.array(legValidator),
  runners: z.array(runnerValidator),
  map: courseMapValidator,
  name: z.string(),
  date: z.number(),
  timeOffset: z.number(),
  statistics: statisticsValidator,
});

export default interface OrienteeringEvent {
  course: Leg[];
  runners: Runner[];
  map: CourseMap;

  name: string;
  date: Date;
  timeOffset: number;

  statistics: Statistics;
}
