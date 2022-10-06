import type Leg from "../../models/leg";

export default function parseIOFXML3CourseOCADExport(
  courseXmlDoc: XMLDocument,
  classIndex: number
): Leg[] {
  const courseDataTag = courseXmlDoc.querySelector("CourseData");

  if (courseDataTag === null)
    throw new Error("Not a valid IOF XML 3 course file.");

  const iofXMLVersion = courseDataTag.getAttribute("iofVersion");

  if (iofXMLVersion !== "3.0") throw new Error("Not a IOF XML 3 course file.");

  const controlsToCoordsMapper = {};

  Array.from(courseXmlDoc.querySelectorAll("RaceCourseData > Control")).forEach(
    (control) => {
      const positionTag = control.querySelector("Position");

      if (positionTag === null) throw new Error("No position for the control");

      const latString = positionTag.getAttribute("lat");
      const lonString = positionTag.getAttribute("lng");

      if (latString === null || lonString === null)
        throw new Error("No latitude or longitude for this control");

      const lat = parseInt(latString, 10);
      const lon = parseInt(lonString, 10);

      if (isNaN(lat) || isNaN(lon))
        throw new Error("Latitude or longitude is not a number");

      const idTag = control.querySelector("Id");

      if (idTag === null || idTag.textContent === null)
        throw new Error("No id for the control");

      controlsToCoordsMapper[idTag.textContent] = {
        lat,
        lon,
      };
    }
  );

  const course = courseXmlDoc.querySelectorAll("Course")[classIndex];

  if (course === undefined)
    throw new Error("No class matching the class index.");

  const legs = Array.from(course.querySelectorAll("CourseControl")).map(
    (control) => {
      const controlTag = control.querySelector("Control");

      if (controlTag === null)
        throw new Error("No control code for this control");

      const controlCodeString = controlTag.textContent;

      if (controlCodeString === null)
        throw new Error("No valid control code for this control");

      const code = parseInt(controlCodeString, 10);

      if (isNaN(code))
        throw new Error("No valid control code for this control");

      const coords = controlsToCoordsMapper[controlCodeString];

      return {
        code,
        lat: coords.lat,
        lon: coords.lon,
        routechoices: [],
      };
    }
  );

  // TODO Filter duplicates
  // const filteredCoursecoords = coursecoords.filter((coord, index) => {
  //   if (index === 0) return true;

  //   return (
  //     Math.abs(coord[0] - coursecoords[index - 1][0]) > 3 &&
  //     Math.abs(coord[1] - coursecoords[index - 1][1]) > 3
  //   );
  // });

  return legs;
}
