import { MapCalibration } from "../models/course-map";
import { Map } from "../models/loggator-api/logator-event";

export default function getMapCallibrationFromLoggatorEventMap(
  loggatorEventMap: Map
): MapCalibration {
  return [
    {
      gps: {
        lat: loggatorEventMap.coordinates.topLeft.lat,
        lon: loggatorEventMap.coordinates.topLeft.lng,
      },
      point: { x: 1, y: 1 },
    },
    {
      gps: {
        lat: loggatorEventMap.coordinates.bottomLeft.lat,
        lon: loggatorEventMap.coordinates.bottomLeft.lng,
      },
      point: { x: 1, y: loggatorEventMap.height },
    },
    {
      gps: {
        lat: loggatorEventMap.coordinates.topRight.lat,
        lon: loggatorEventMap.coordinates.topRight.lng,
      },
      point: { x: loggatorEventMap.width, y: 1 },
    },
  ];
}
