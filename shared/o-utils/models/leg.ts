import type Routechoice from "./routechoice";

export default interface Leg {
  code: string;
  lat: number;
  lon: number;
  routechoices: Routechoice[];
}
