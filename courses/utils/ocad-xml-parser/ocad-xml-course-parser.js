function iofXmlCourseExportTo2dRerunJson(courseXmlDoc, classIndex) {
  const ocadTopLeft = {
    x: courseXmlDoc.querySelector("MapPositionTopLeft").getAttribute("x"),
    y: courseXmlDoc.querySelector("MapPositionTopLeft").getAttribute("y"),
  };

  const ocadBottomRight = {
    x: courseXmlDoc.querySelector("MapPositionBottomRight").getAttribute("x"),
    y: courseXmlDoc.querySelector("MapPositionBottomRight").getAttribute("y"),
  };

  const controlsToCoordsMapper = {};

  Array.from(courseXmlDoc.querySelectorAll("RaceCourseData > Control")).forEach(
    (control) => {
      const ocadCoords = {
        x: control.querySelector("MapPosition").getAttribute("x"),
        y: control.querySelector("MapPosition").getAttribute("y"),
      };

      const rerun2DCoords = convertOcadCoordsTo2DRerunCoords(
        ocadCoords,
        ocadTopLeft,
        ocadBottomRight
      );

      controlsToCoordsMapper[control.querySelector("Id").textContent] = {
        x: rerun2DCoords.x,
        y: rerun2DCoords.y,
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

function convertOcadCoordsTo2DRerunCoords(coords, topLeft, bottomRight) {
  return {
    x: (coords.x * mapviewer.map.width) / (bottomRight.x - topLeft.x),
    y: (coords.y * mapviewer.map.height) / (bottomRight.y - topLeft.y),
  };
}

export default iofXmlCourseExportTo2dRerunJson;
