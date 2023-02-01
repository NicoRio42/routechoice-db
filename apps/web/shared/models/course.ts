import { z } from "zod";
import { tagSchema } from "./tag";

export const courseWithoutIDValidator = z.object({
  name: z.string(),
  date: z.number(),
  tags: z.array(tagSchema),
  liveProviderURL: z.string(),
});

export type CourseWithoutID = z.infer<typeof courseWithoutIDValidator>;

export const courseValidator = courseWithoutIDValidator.extend({
  id: z.string(),
});

export type Course = z.infer<typeof courseValidator>;
