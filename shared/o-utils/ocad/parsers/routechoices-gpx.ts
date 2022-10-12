import type Leg from "../../models/leg";
import { distanceBetweenTwoGPSPoints } from "../../utils/distance-helpers";
import { names, routesColors } from "../utils/routechoices-names-colors";

export default function parseGPXRoutechoicesOCADExpor(
  routechoicesXmlDoc: XMLDocument,
  legs: Leg[]
): Leg[] {
  if (legs.length === 0) return [];

  const clonedLegs = structuredClone(legs);

  const rawRoutechoices: RawRoutechoice[] = Array.from(
    routechoicesXmlDoc.querySelectorAll("trk")
  ).map((trk) => {
    const rawPoints: [number, number][] = Array.from(
      trk.querySelectorAll("trkpt")
    ).map((trkpt) => {
      const latString = trkpt.getAttribute("lat");
      const lonString = trkpt.getAttribute("lon");

      if (latString === null || lonString === null)
        throw new Error("There is no latitude or longitude for this point.");

      const lat = parseFloat(latString);
      const lon = parseFloat(lonString);

      if (isNaN(lat) || isNaN(lon))
        throw new Error(
          "There is a problem with the format of the latitude or the longitude."
        );

      return [lat, lon];
    });

    const pointsString = rawPoints.flat().join("");

    return { rawPoints, pointsString };
  });

  const filteredRawRoutechoices: RawRoutechoice[] = [];

  rawRoutechoices.forEach((rc, i) => {
    if (
      rawRoutechoices
        .slice(0, i)
        .every((route) => route.pointsString !== rc.pointsString)
    )
      filteredRawRoutechoices.push(rc);
  });

  filteredRawRoutechoices.forEach((rc, rcIndex) => {
    const length = rc.rawPoints.reduce((previous, current, index) => {
      if (index === rc.rawPoints.length - 1) {
        return previous;
      }

      return (
        previous +
        distanceBetweenTwoGPSPoints(
          [current[0], current[1]],
          [rc.rawPoints[index + 1][0], rc.rawPoints[index + 1][1]]
        )
      );
    }, 0);

    let attributedLegIndex = 0;

    let distance = distanceBetweenTwoGPSPoints(
      [rc.rawPoints[0][0], rc.rawPoints[0][1]],
      [clonedLegs[0].lat, clonedLegs[0].lon]
    );

    clonedLegs.forEach((leg, i) => {
      const newDistance = distanceBetweenTwoGPSPoints(
        [rc.rawPoints[0][0], rc.rawPoints[0][1]],
        [leg.lat, leg.lon]
      );

      if (newDistance < distance) {
        distance = newDistance;
        attributedLegIndex = i;
      }
    });

    if (distance > 500)
      console.warn(
        "Routechoice first point is more than 500m away from any control"
      );

    clonedLegs[attributedLegIndex].routechoices.push({
      id: rcIndex,
      name: "",
      color: "",
      length,
      track: rc.rawPoints,
    });
  });

  return clonedLegs.map((leg) => ({
    ...leg,
    routechoices: leg.routechoices.map((rc, i) => ({
      ...rc,
      name: names[i],
      color: routesColors[i],
    })),
  }));
}

interface RawRoutechoice {
  rawPoints: [number, number][];
  pointsString: string;
}
