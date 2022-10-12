export class CoordinatesConverter {
  private c1: number;
  private c2: number;
  private c3: number;
  private c4: number;
  private c5: number;
  private c6: number;
  private c1inv: number;
  private c2inv: number;
  private c3inv: number;
  private c4inv: number;
  private c5inv: number;
  private c6inv: number;

  constructor(mapCallibration: MapCalibration) {
    this.c1 =
      mapCallibration[0].pointxy.x * mapCallibration[0].gps.lon +
      mapCallibration[1].pointxy.x * mapCallibration[1].gps.lon +
      mapCallibration[2].pointxy.x * mapCallibration[2].gps.lon;

    this.c2 =
      mapCallibration[0].pointxy.x * mapCallibration[0].gps.lat +
      mapCallibration[1].pointxy.x * mapCallibration[1].gps.lat +
      mapCallibration[2].pointxy.x * mapCallibration[2].gps.lat;

    this.c3 =
      mapCallibration[0].pointxy.x +
      mapCallibration[1].pointxy.x +
      mapCallibration[2].pointxy.x;

    this.c4 =
      mapCallibration[0].pointxy.y * mapCallibration[0].gps.lon +
      mapCallibration[1].pointxy.y * mapCallibration[1].gps.lon +
      mapCallibration[2].pointxy.y * mapCallibration[2].gps.lon;

    this.c5 =
      mapCallibration[0].pointxy.y * mapCallibration[0].gps.lat +
      mapCallibration[1].pointxy.y * mapCallibration[1].gps.lat +
      mapCallibration[2].pointxy.y * mapCallibration[2].gps.lat;

    this.c6 =
      mapCallibration[0].pointxy.y +
      mapCallibration[1].pointxy.y +
      mapCallibration[2].pointxy.y;

    this.c1inv =
      mapCallibration[0].pointxy.x * mapCallibration[0].gps.lon +
      mapCallibration[1].pointxy.x * mapCallibration[1].gps.lon +
      mapCallibration[2].pointxy.x * mapCallibration[2].gps.lon;

    this.c4inv =
      mapCallibration[0].pointxy.x * mapCallibration[0].gps.lat +
      mapCallibration[1].pointxy.x * mapCallibration[1].gps.lat +
      mapCallibration[2].pointxy.x * mapCallibration[2].gps.lat;

    this.c2inv =
      mapCallibration[0].pointxy.y * mapCallibration[0].gps.lon +
      mapCallibration[1].pointxy.y * mapCallibration[1].gps.lon +
      mapCallibration[2].pointxy.y * mapCallibration[2].gps.lon;

    this.c5inv =
      mapCallibration[0].pointxy.y * mapCallibration[0].gps.lat +
      mapCallibration[1].pointxy.y * mapCallibration[1].gps.lat +
      mapCallibration[2].pointxy.y * mapCallibration[2].gps.lat;

    this.c3inv =
      mapCallibration[0].gps.lon +
      mapCallibration[1].gps.lon +
      mapCallibration[2].gps.lon;

    this.c6inv =
      mapCallibration[0].gps.lat +
      mapCallibration[1].gps.lat +
      mapCallibration[2].gps.lat;
  }

  latLongToXY([lat, lon]: [number, number]): [number, number] {
    const x = this.c1 * lon + this.c2 * lat + this.c3;
    const y = this.c4 * lon + this.c5 * lat + this.c6;

    return [x, y];
  }

  xYToLatLong([x, y]: [number, number]): [number, number] {
    const lon = this.c1inv * x + this.c2inv * y + this.c3inv;
    const lat = this.c4inv * x + this.c5inv * y + this.c6inv;

    return [lat, lon];
  }
}

export function getMapCalibrationFromCalString(
  calstring: string
): MapCalibration {
  const calStringArray = calstring.split("|");

  if (calStringArray.length !== 12)
    throw new Error("Problem with calstring format");

  const [lon1, lat1, x1, y1, lon2, lat2, x2, y2, lon3, lat3, x3, y3] =
    calStringArray.map(parseFloat);

  const calArray = [lon1, lat1, x1, y1, lon2, lat2, x2, y2, lon3, lat3, x3, y3];

  if (calArray.some(isNaN)) throw new Error("Problem with calstring format");

  return [
    {
      gps: { lat: lat1, lon: lon1 },
      pointxy: { x: x1, y: y1 },
    },
    {
      gps: { lat: lat2, lon: lon2 },
      pointxy: { x: x2, y: y2 },
    },
    {
      gps: { lat: lat3, lon: lon3 },
      pointxy: { x: x3, y: y3 },
    },
  ];
}

export interface MapCalibrationPoint {
  gps: { lat: number; lon: number };
  pointxy: { x: number; y: number };
}

export type MapCalibration = [
  MapCalibrationPoint,
  MapCalibrationPoint,
  MapCalibrationPoint
];
