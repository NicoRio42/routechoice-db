import { z } from "zod";

export const routechoiceValidator = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  length: z.number(),
  track: z.tuple([z.number(), z.number()]),
});

export default interface Routechoice {
  id: number;
  name: string;
  color: string;
  length: number;
  track: [number, number][];
}
