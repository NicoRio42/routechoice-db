import { z } from "zod";

export const routechoiceWithoutTrackValidator = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  length: z.number(),
});

export const routechoiceValidator = routechoiceWithoutTrackValidator.extend({
  track: z.array(z.tuple([z.number(), z.number()])),
});

export interface RoutechoiceWithoutTrack {
  id: number;
  name: string;
  color: string;
  length: number;
}

export default interface Routechoice extends RoutechoiceWithoutTrack {
  track: [number, number][];
}

export interface RoutechoiceWithSerializedTrack
  extends RoutechoiceWithoutTrack {
  track: string;
}
