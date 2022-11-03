import { z } from "zod";
import type Routechoice from "./routechoice";
import { routechoiceValidator } from "./routechoice";

export const legValidator = z.object({
  startControlCode: z.string(),
  finishControlCode: z.string(),
  startLat: z.number(),
  startLon: z.number(),
  routechoices: z.array(routechoiceValidator),
});

export default interface Leg {
  startControlCode: string;
  finishControlCode: string;
  startLat: number;
  startLon: number;
  routechoices: Routechoice[];
}
