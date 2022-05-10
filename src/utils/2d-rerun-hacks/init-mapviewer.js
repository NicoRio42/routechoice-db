import { getFunctions, httpsCallable } from "firebase/functions";
import { selectHack } from "./select-hack";

/**
 *
 * @param {import("../../models/mapviewer").Mapviewer} mapviewer
 * @param {HTMLIFrameElement} iframe
 * @param {any} dataUrl
 */
export async function initMapviewer(mapviewer, iframe, course) {
  const functions = getFunctions();
  const get2DRerunData = httpsCallable(functions, "get2DRerunData");

  const get2DRerunDataUrl = buildGet2DRerunDataUrlFromLogatorUrl(
    course.twoDRerunUrl
  );

  const response = await get2DRerunData(get2DRerunDataUrl);

  mapviewer.handlelLoadseuSuccessResponse(response.data, "");

  if (course.courseAndRoutechoices === undefined) {
    return;
  }

  buildCourseAndRoutechoices(mapviewer, iframe, course.courseAndRoutechoices);
}

export function buildCourseAndRoutechoices(
  mapviewer,
  iframe,
  courseAndRoutechoicesData
) {
  const data = { ...courseAndRoutechoicesData };

  mapviewer.tags = data.tags;
  mapviewer.coursecoords = data.coursecoords;
  mapviewer.otechinfo = data.otechinfo;
  mapviewer.request_redraw();
  mapviewer.update_routediv();
  console.log(mapviewer);
  iframe.contentDocument.getElementById("shown").click();
  selectHack(iframe, "selectmode", "analyzecourse");
  selectHack(iframe, "showtagsselect", "1");
}

/**
 *
 * @param {string} logatorUrl
 * @returns {string}
 */
function buildGet2DRerunDataUrlFromLogatorUrl(logatorUrl) {
  const urlArray = logatorUrl.split("/");
  const logatorId = urlArray[urlArray.length - 1];
  return `http://loggator2.worldofo.com/getseu_json.php?baseurl=http://www.tulospalvelu.fi/gps/&idstr=logatec${logatorId}`;
}
