import { z } from "zod";
import type Routechoice from "./routechoice";
import { routechoiceValidator } from "./routechoice";

export const legValidator = z.object({
  code: z.string(),
  lat: z.number(),
  lon: z.number(),
  routechoices: z.array(routechoiceValidator),
});

export default interface Leg {
  code: string;
  lat: number;
  lon: number;
  routechoices: Routechoice[];
}
