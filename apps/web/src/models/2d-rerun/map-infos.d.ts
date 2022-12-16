export interface Rerun2dMapInfos {
  status: string;
  map: {
    imagelink: URL;
    width: number;
    height: number;
    calstring: string;
  };
  routes: MapInfosRoute[];
}

interface MapInfosRoute {
  unit: string;
  runnername: string;
  lats: string;
  lngs: string;
  times: string;
  starttime: Date;
}
