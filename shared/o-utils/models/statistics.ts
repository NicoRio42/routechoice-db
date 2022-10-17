import { z } from "zod";

export const routeChoicesStatisticValidator = z.object({
  fastestTime: z.optional(z.number()),
  firstQuartileTime: z.optional(z.number()),
  numberOfRunners: z.optional(z.number()),
  color: z.optional(z.string()),
});

export interface RouteChoicesStatistic {
  fastestTime?: number;
  firstQuartileTime?: number;
  numberOfRunners?: number;
  color?: string;
}

export const statisticsValidator = z.object({
  leader: z.array(z.number()),
  superman: z.array(z.number()),
  supermanSplits: z.array(z.number()),
  mistakesSum: z.array(z.number()),
  routeChoicesStatistics: z.array(z.record(routeChoicesStatisticValidator)),
});

export default interface Statistics {
  leader: number[];
  superman: number[];
  supermanSplits: number[];
  mistakesSum: number[];
  routeChoicesStatistics: Record<string, RouteChoicesStatistic>[];
}
