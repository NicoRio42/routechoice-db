import { z } from "zod";
import type Routechoice from "./routechoice";
import {
  routechoiceValidator,
  type RoutechoiceWithSerializedTrack,
} from "./routechoice";

export const legWithoutRoutechoicesValidator = z.object({
  startControlCode: z.string(),
  finishControlCode: z.string(),
  startLat: z.number(),
  startLon: z.number(),
});

export const legValidator = legWithoutRoutechoicesValidator.extend({
  routechoices: z.array(routechoiceValidator),
});

export interface LegWithoutRoutechoices {
  startControlCode: string;
  finishControlCode: string;
  startLat: number;
  startLon: number;
}

export default interface Leg extends LegWithoutRoutechoices {
  routechoices: Routechoice[];
}

export interface LegWithSerializedNestedArrays extends LegWithoutRoutechoices {
  routechoices: RoutechoiceWithSerializedTrack[];
}

export function serializeNestedArraysInLegs(
  legs: Leg[]
): LegWithSerializedNestedArrays[] {
  return legs.map((leg) => ({
    ...leg,
    routechoices: leg.routechoices.map((rc) => ({
      ...rc,
      track: JSON.stringify(rc.track),
    })),
  }));
}

export function parseNestedArraysInLegs(
  legs: LegWithSerializedNestedArrays[]
): Leg[] {
  return legs.map((leg) => ({
    ...leg,
    routechoices: leg.routechoices.map((rc) => ({
      ...rc,
      track: JSON.parse(rc.track),
    })),
  }));
}
