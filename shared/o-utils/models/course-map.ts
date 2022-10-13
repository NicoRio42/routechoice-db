export default interface CourseMap {
  url: string;
  calibration: MapCalibration;
}

interface MapCalibrationPoint {
  gps: { lat: number; lon: number };
  point: { x: number; y: number };
}

export type MapCalibration = [
  MapCalibrationPoint,
  MapCalibrationPoint,
  MapCalibrationPoint
];
