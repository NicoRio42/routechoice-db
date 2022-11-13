import { CoordinatesConverter } from "../map/coords-converter";
import type { TwoDRerunCourseExport } from "../models/2d-rerun/course-export";
import type { Tag } from "../models/2d-rerun/mapviewer";
import type { MapCalibration } from "../models/course-map";
import type Leg from "../models/leg";
import type Control from "../models/control";

export default function mapCourseAndRoutechoicesTo2DRerun(
  legs: Leg[],
  course: Control[],
  callibration: MapCalibration
): TwoDRerunCourseExport {
  const coordinatesConverter = new CoordinatesConverter(callibration);

  return {
    tags: legs.flatMap((leg) =>
      formatRoutechoicesForTwoDRerun(leg, coordinatesConverter)
    ),
    coursecoords: course.map((control) => {
      const xyPoint = coordinatesConverter.latLongToXY([
        control.lat,
        control.lon,
      ]);

      return `${xyPoint[0]},${xyPoint[1]}`;
    }),
  };
}

function formatRoutechoicesForTwoDRerun(
  leg: Leg,
  coordinatesConverter: CoordinatesConverter
): Tag[] {
  return leg.routechoices.map((routechoice) => {
    const lastPoint = routechoice.track.at(-1);
    const lastPointXY =
      lastPoint !== undefined
        ? coordinatesConverter.latLongToXY(lastPoint)
        : [0, 0];

    return {
      type: "route",
      opened_dialog: 0,
      ready_for_dialog: 0,
      runnername: "Route",
      points: routechoice.track.map((point) => point.join(",")),
      pointsxy: routechoice.track.map(
        (point, index) =>
          `${coordinatesConverter
            .latLongToXY([point[0], point[1]])
            .join(",")},${index * 3},0`
      ),
      currenttime: 36,
      currentalt: 0,
      totalup: 0,
      show: 1,
      offsettxt_x: 0,
      offsettxt_y: 0,
      offsettxt_basex: 0,
      offsettxt_basey: 0,
      group: 0,
      x: lastPointXY[0],
      y: lastPointXY[1],
      length,
      name: routechoice.name,
      description: "",
      color: routechoice.color,
    };
  });
}
