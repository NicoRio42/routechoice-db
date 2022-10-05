import type Routechoice from "./routechoice";

export default interface Leg {
  code: number;
  lat: number;
  lon: number;
  routechoices: Routechoice[];
}
