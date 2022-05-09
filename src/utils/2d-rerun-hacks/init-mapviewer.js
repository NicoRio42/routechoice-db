import { getFunctions, httpsCallable } from "firebase/functions";
import { selectHack } from "./select-hack";

/**
 *
 * @param {import("../../models/mapviewer").Mapviewer} mapviewer
 * @param {HTMLIFrameElement} iframe
 * @param {string} dataUrl
 * @returns {Promise}
 */
export async function initMapviewer(mapviewer, iframe, logatorUrl) {
  const functions = getFunctions();
  const get2DRerunData = httpsCallable(functions, "get2DRerunData");

  const get2DRerunDataUrl = buildGet2DRerunDataUrlFromLogatorUrl(logatorUrl);
  get2DRerunData(get2DRerunDataUrl).then(
    (
      /**@type {import("../../models/2d-rerun/get-2d-rerun-data-response").Get2DRerunDataResponse} */
      response
    ) => {
      console.log(response.data);
      mapviewer.handlelLoadseuSuccessResponse(response.data, "");
    }
  );

  const res = await fetch("course-tags.json");
  const data = await res.json();
  mapviewer.tags = data.tags;
  mapviewer.coursecoords = data.coursecoords;
  mapviewer.otechinfo = data.otechinfo;
  mapviewer.request_redraw();
  mapviewer.update_routediv();
  console.log(mapviewer);
  iframe.contentDocument.getElementById("shown").click();
  selectHack(iframe, "selectmode", "analyzecourse");
  selectHack(iframe, "showtagsselect", "1");

  return data;
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
