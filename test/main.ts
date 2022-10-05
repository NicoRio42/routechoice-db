import { IOF_XML_3_SPLIT_TIMES } from "../shared/o-utils/mocks/eoc-md-q-men-a";
import { parseIOFXML3SplitTimesFile } from "../shared/o-utils/split-times/parsers/iof-xml-3";

IOF_XML_3_SPLIT_TIMES;
const parser = new DOMParser();
const xmlDoc3 = parser.parseFromString(IOF_XML_3_SPLIT_TIMES, "text/xml");

try {
  const runners = parseIOFXML3SplitTimesFile(xmlDoc3, "Men-A", "+02:00", 0);
  console.log(runners);
} catch (error) {
  console.log(error);
}
