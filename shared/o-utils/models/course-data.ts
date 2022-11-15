import { z } from "zod";
import type Control from "./control";
import { controlSchema } from "./control";
import type CourseMap from "./course-map";
import { courseMapValidator } from "./course-map";
import type Leg from "./leg";
import { legValidator, type LegWithSerializedNestedArrays } from "./leg";
import type Runner from "./runner";
import { runnerValidator } from "./runner";
import type Statistics from "./statistics";
import { statisticsValidator } from "./statistics";

export const courseDataWithoutRunnersValidator = z.object({
  legs: z.array(legValidator),
  course: z.array(controlSchema),
  map: courseMapValidator.nullable(),
  name: z.string(),
  date: z.number(),
  timeOffset: z.number(),
  statistics: statisticsValidator.nullable(),
});

export const courseDataValidator = courseDataWithoutRunnersValidator.extend({
  runners: z.array(runnerValidator),
});

export interface CourseDataWithoutRunnersAndLegs {
  course: Control[];
  map: CourseMap | null;

  name: string;
  date: number;
  timeOffset: number;

  statistics: Statistics | null;
}
export interface CourseDataWithoutRunnersWithSerializedNestedArrays
  extends CourseDataWithoutRunnersAndLegs {
  legs: LegWithSerializedNestedArrays[];
}
export interface CourseDataWithoutRunners
  extends CourseDataWithoutRunnersAndLegs {
  legs: Leg[];
}

export default interface CourseData extends CourseDataWithoutRunners {
  runners: Runner[];
}
