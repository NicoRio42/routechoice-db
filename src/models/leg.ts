import { Routechoice } from "./routechoice";

export interface Leg {
  controlCode: number;
  timeOverall: number;
  time?: number;
  rankSplit?: number;
  timeBehindSplit?: number;
  rankOverall?: number;
  timeBehindOverall?: number;
  timeBehindSuperman?: number;
  isMistake?: boolean;
  timeWithoutMistake?: number;
  timeLost?: number;
  routeChoice?: Routechoice;
}
