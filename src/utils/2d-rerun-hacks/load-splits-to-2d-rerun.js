import { IOFXMLParser } from "../iof-xml-parser/IOFXMLParser";

/**
 * Load splititmes into 2dRerun
 * @param {HTMLIFrameElement} iframe
 * @param {import("../../models/mapviewer").Mapviewer} mapviewer
 * @param {IOFXMLParser} splitTimes
 */
export function loadSplitsTo2dRerun(iframe, mapviewer, splitTimes) {
  mapviewer.routes.forEach((route, routeIndex) => {
    let runner = splitTimes.runners.find(
      (runner) => runner.rerun2dRouteIndex === routeIndex
    );

    route.splits = [];

    if (runner?.legs.length) {
      let date = new Date(runner.startTime);
      let startTime = Math.round(date.valueOf() / 1000);

      // SplitTime for start
      route.splits.push({ index: startTime - route.zerotime });

      // Rest of the splitTimes
      runner.legs.forEach((leg) => {
        route.splits.push({
          index: startTime + leg.timeOverall - route.zerotime,
        });
      });

      route.manualsplits = 1;
    }
  });

  iframe.contentDocument.getElementById("shown").click();
}
