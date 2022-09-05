function iofXmlCourseExportTo2dRerunJson(courseXmlDoc, classIndex) {
  const controlsToCoordsMapper = {};

  Array.from(courseXmlDoc.querySelectorAll("RaceCourseData > Control")).forEach(
    (control) => {
      const point = mapviewer.map.toxy(
        control.querySelector("Position").getAttribute("lat"),
        control.querySelector("Position").getAttribute("lng")
      );

      controlsToCoordsMapper[control.querySelector("Id").textContent] = {
        x: point.x,
        y: point.y,
      };
    }
  );

  const course = courseXmlDoc.querySelectorAll("Course")[classIndex];

  const coursecoords = Array.from(course.querySelectorAll("CourseControl")).map(
    (control) => {
      const controlId = control.querySelector("Control").textContent;

      return [
        controlsToCoordsMapper[controlId].x,
        controlsToCoordsMapper[controlId].y,
      ];
    }
  );

  const filteredCoursecoords = coursecoords.filter((coord, index) => {
    if (index === 0) return true;

    return (
      Math.abs(coord[0] - coursecoords[index - 1][0]) > 3 &&
      Math.abs(coord[1] - coursecoords[index - 1][1]) > 3
    );
  });

  const stringCourseCoords = filteredCoursecoords.map(
    (coord) => `${coord[0]},${coord[1]}`
  );

  return stringCourseCoords;
}

export default iofXmlCourseExportTo2dRerunJson;
