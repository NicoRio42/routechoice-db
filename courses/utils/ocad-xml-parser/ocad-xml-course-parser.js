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
      return `${controlsToCoordsMapper[controlId].x},${controlsToCoordsMapper[controlId].y}`;
    }
  );

  return coursecoords;
}

export default iofXmlCourseExportTo2dRerunJson;
