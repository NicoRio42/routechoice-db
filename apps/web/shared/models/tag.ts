import { z } from "zod";

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export type Tag = {
  id: string;
  name: string;
  color: string;
};
