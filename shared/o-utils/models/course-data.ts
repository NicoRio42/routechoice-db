import { z } from "zod";
import { courseMapValidator } from "./course-map";
import type CourseMap from "./course-map";
import { legValidator } from "./leg";
import type Leg from "./leg";
import { runnerValidator } from "./runner";
import type Runner from "./runner";
import { statisticsValidator } from "./statistics";
import type Statistics from "./statistics";
import type Control from "./control";

export const courseDataWithoutRunnersValidator = z.object({
  course: z.array(legValidator),
  map: courseMapValidator.nullable(),
  name: z.string(),
  date: z.number(),
  timeOffset: z.number(),
  statistics: statisticsValidator.nullable(),
});

export const courseDataValidator = courseDataWithoutRunnersValidator.extend({
  runners: z.array(runnerValidator),
});

export default interface CourseData {
  course: Control[];
  legs: Leg[];
  runners: Runner[];
  map: CourseMap | null;

  name: string;
  date: number;
  timeOffset: number;

  statistics: Statistics | null;
}
