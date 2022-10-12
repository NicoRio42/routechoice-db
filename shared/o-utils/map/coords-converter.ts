export function latLongToXY(
  [lat, lon]: [number, number],
  mapCallibration: MapCalibration
): [number, number] {
  const c1 =
    mapCallibration[0].pointxy.x * mapCallibration[0].gps.lon +
    mapCallibration[1].pointxy.x * mapCallibration[1].gps.lon +
    mapCallibration[2].pointxy.x * mapCallibration[2].gps.lon;
  const c2 =
    mapCallibration[0].pointxy.x * mapCallibration[0].gps.lat +
    mapCallibration[1].pointxy.x * mapCallibration[1].gps.lat +
    mapCallibration[2].pointxy.x * mapCallibration[2].gps.lat;
  const c3 =
    mapCallibration[0].pointxy.x +
    mapCallibration[1].pointxy.x +
    mapCallibration[2].pointxy.x;
  const c4 =
    mapCallibration[0].pointxy.y * mapCallibration[0].gps.lon +
    mapCallibration[1].pointxy.y * mapCallibration[1].gps.lon +
    mapCallibration[2].pointxy.y * mapCallibration[2].gps.lon;
  const c5 =
    mapCallibration[0].pointxy.y * mapCallibration[0].gps.lat +
    mapCallibration[1].pointxy.y * mapCallibration[1].gps.lat +
    mapCallibration[2].pointxy.y * mapCallibration[2].gps.lat;
  const c6 =
    mapCallibration[0].pointxy.y +
    mapCallibration[1].pointxy.y +
    mapCallibration[2].pointxy.y;

  const x = c1 * lon + c2 * lat + c3;
  const y = c4 * lon + c5 * lat + c6;

  return [x, y];
}

export function xYToLatLong(
  [x, y]: [number, number],
  mapCallibration: MapCalibration
): [number, number] {
  const c1inv =
    mapCallibration[0].pointxy.x * mapCallibration[0].gps.lon +
    mapCallibration[1].pointxy.x * mapCallibration[1].gps.lon +
    mapCallibration[2].pointxy.x * mapCallibration[2].gps.lon;
  const c4inv =
    mapCallibration[0].pointxy.x * mapCallibration[0].gps.lat +
    mapCallibration[1].pointxy.x * mapCallibration[1].gps.lat +
    mapCallibration[2].pointxy.x * mapCallibration[2].gps.lat;
  const c2inv =
    mapCallibration[0].pointxy.y * mapCallibration[0].gps.lon +
    mapCallibration[1].pointxy.y * mapCallibration[1].gps.lon +
    mapCallibration[2].pointxy.y * mapCallibration[2].gps.lon;
  const c5inv =
    mapCallibration[0].pointxy.y * mapCallibration[0].gps.lat +
    mapCallibration[1].pointxy.y * mapCallibration[1].gps.lat +
    mapCallibration[2].pointxy.y * mapCallibration[2].gps.lat;
  const c3inv =
    mapCallibration[0].gps.lon +
    mapCallibration[1].gps.lon +
    mapCallibration[2].gps.lon;
  const c6inv =
    mapCallibration[0].gps.lat +
    mapCallibration[1].gps.lat +
    mapCallibration[2].gps.lat;

  var lon = c1inv * x + c2inv * y + c3inv;
  var lat = c4inv * x + c5inv * y + c6inv;

  return [lat, lon];
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
