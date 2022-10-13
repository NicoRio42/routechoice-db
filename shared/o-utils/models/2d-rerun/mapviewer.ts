import { Rerun2dMapInfos } from "./map-infos";

export interface Mapviewer {
  tags: Tag[];
  coursecoords: string;
  otechinfo: Record<string, any>;
  routes: TwoDRerunRoute[];
  loadseu: Loadseu;
  request_redraw: VoidFunction;
  update_routediv: VoidFunction;
  handlelLoadseuSuccessResponse: HandlelLoadseuSuccessResponse;
}

export interface TwoDRerunRoute {
  indexnumber: number;
  runnername: string;
  latarray: number[];
  lngarray: number[];
  timearray: number[];
  splits: { index: number }[];
  zerotime: number;
  manualsplits: number;
}

interface Loadseu {
  (baseUrl: string, coursId: string): void;
}
interface HandlelLoadseuSuccessResponse {
  (rerun2dMapInfos: Rerun2dMapInfos, coursId: string): void;
}

interface VoidFunction {
  (): void;
}

export interface Tag {
  type: string;
  opened_dialog: number;
  ready_for_dialog: number;
  runnername: string;
  points: string[];
  pointsxy: string[];
  currenttime: number;
  currentalt: number;
  totalup: number;
  show: number;
  offsettxt_x: number;
  offsettxt_y: number;
  offsettxt_basex: number;
  offsettxt_basey: number;
  group: number;
  x: number;
  y: number;
  length: number;
  name: string;
  description: string;
  color: string;
}
