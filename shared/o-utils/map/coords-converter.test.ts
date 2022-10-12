import { describe, expect, test } from "vitest";
import {
  getMapCalibrationFromCalString,
  latLongToXY,
  xYToLatLong,
} from "./coords-converter";
import type { MapCalibration } from "./coords-converter";

describe("Coordinates converter", () => {
  const mapCallibration = getMapCalibrationFromCalString(calstring);

  test("getMapCalibrationFromCalString", () => {
    expect(mapCallibration).toStrictEqual(expectedMapCallibration);
  });

  const [x, y] = latLongToXY(
    [45.79130295443253, 4.848683532105073],
    expectedMapCallibration
  );

  test("latLongToXY", () => {
    expect([x, y]).toStrictEqual([863.5162690847026, 2867.6643295786716]);
  });

  const [lat, lon] = xYToLatLong(
    [863.5162690847026, 2867.6643295786716],
    expectedMapCallibration
  );

  test("xYToLatLong", () => {
    expect([lat, lon]).toStrictEqual([45.79130295443253, 4.848683532105073]);
  });
});

// "points": [
//     "45.79130295443253,4.848683532105073",
//     "45.79168241748819,4.8479751579630115",
//     "45.791197050759095,4.848077631269418",
//     "45.7911973352519,4.847742451277892",
//     "45.79136014095238,4.847635742503312"
//   ],
//   "pointsxy": [
//     "863.5162690847026,2867.6643295786716,0,0",
//     "645.8199733118443,2702.8475890373256,3,0",
//     "678.378257559634,2915.046589560818,6,0",
//     "575.8154073066125,2915.499307993119,9,0",
//     "542.7601539526881,2844.4463414078223,12,0"
//   ],

const calstring =
  "4.845917897863|45.797865365427|1|1|4.8545093729956|45.797831552578|2630|1|4.854449410137|45.790424748573|2630|3242";

const expectedMapCallibration: MapCalibration = [
  {
    gps: { lat: 45.797865365427, lon: 4.845917897863 },
    pointxy: { x: 1, y: 1 },
  },
  {
    gps: { lat: 45.797831552578, lon: 4.8545093729956 },
    pointxy: { x: 2630, y: 1 },
  },
  {
    gps: { lat: 45.790424748573, lon: 4.854449410137 },
    pointxy: { x: 2630, y: 3242 },
  },
];
