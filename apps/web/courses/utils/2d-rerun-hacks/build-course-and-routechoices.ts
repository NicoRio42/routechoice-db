import type { TwoDRerunCourseExport } from "../../../shared/o-utils/models/2d-rerun/course-export";
import { selectHack } from "./select-hack";

function buildCourseAndRoutechoices(
  courseAndRoutechoicesData: TwoDRerunCourseExport
): void {
  const data = { ...courseAndRoutechoicesData };

  mapviewer.tags = data.tags.map((tag) => ({
    ...tag,
    color: tag.color.slice(1),
  }));
  mapviewer.coursecoords = data.coursecoords;
  mapviewer.otechinfo = data.otechinfo;
  mapviewer.request_redraw();
  mapviewer.update_routediv();
  document.getElementById("shown").click();
  selectHack("selectmode", "analyzecourse");
  selectHack("showtagsselect", "1");
}

export default buildCourseAndRoutechoices;
