import { describe, expect, test } from "vitest";
import parseIOFXML3CourseOCADExport from "./iof-xml-3-course";
import { IOF_XML_3_COURSE } from "./mocks/iof-xml-3-course";

describe("parseIOFXML3SplitTimesFile()", () => {
  test("throw error when iof xml version is not 3.0.", () => {
    const parser = new DOMParser();
    const xmlDoc3 = parser.parseFromString(IOF_XML_3_COURSE, "text/xml");
    const legs = parseIOFXML3CourseOCADExport(xmlDoc3, 0);

    expect(legs).toStrictEqual(expectedLegs);
  });
});

const expectedLegs = [
  { code: "S1", lat: 45.212847, lon: 5.793802, routechoices: [] },
  { code: "31", lat: 45.213173, lon: 5.792364, routechoices: [] },
  { code: "32", lat: 45.212336, lon: 5.78996, routechoices: [] },
  { code: "33", lat: 45.212446, lon: 5.789548, routechoices: [] },
  { code: "34", lat: 45.212793, lon: 5.787053, routechoices: [] },
  { code: "35", lat: 45.213601, lon: 5.787004, routechoices: [] },
  { code: "36", lat: 45.214257, lon: 5.785209, routechoices: [] },
  { code: "37", lat: 45.214023, lon: 5.784339, routechoices: [] },
  { code: "38", lat: 45.213519, lon: 5.785003, routechoices: [] },
  { code: "46", lat: 45.2133, lon: 5.78612, routechoices: [] },
  { code: "39", lat: 45.213758, lon: 5.787612, routechoices: [] },
  { code: "40", lat: 45.21394, lon: 5.78926, routechoices: [] },
  { code: "41", lat: 45.214394, lon: 5.789118, routechoices: [] },
  { code: "42", lat: 45.214319, lon: 5.790881, routechoices: [] },
  { code: "43", lat: 45.213396, lon: 5.790756, routechoices: [] },
  { code: "44", lat: 45.213072, lon: 5.793086, routechoices: [] },
  { code: "45", lat: 45.213652, lon: 5.793643, routechoices: [] },
  { code: "47", lat: 45.21361, lon: 5.795543, routechoices: [] },
  { code: "48", lat: 45.212894, lon: 5.796382, routechoices: [] },
  { code: "49", lat: 45.212282, lon: 5.795804, routechoices: [] },
  { code: "50", lat: 45.21234, lon: 5.796351, routechoices: [] },
  { code: "51", lat: 45.213149, lon: 5.795548, routechoices: [] },
  { code: "52", lat: 45.213071, lon: 5.794389, routechoices: [] },
  { code: "F1", lat: 45.213317, lon: 5.794046, routechoices: [] },
];
