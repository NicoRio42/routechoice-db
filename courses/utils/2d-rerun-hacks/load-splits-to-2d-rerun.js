/**
 * Load splititmes into 2dRerun
 * @param {IOFXMLParser} splitTimes
 */
export function loadSplitsTo2dRerun(splitTimes) {
  mapviewer.routes.forEach((route, routeIndex) => {
    const runner = splitTimes.runners.find(
      (runner) => runner.rerun2dRouteIndex === routeIndex
    );

    route.splits = [];

    if (runner?.legs.length) {
      const date = new Date(runner.startTime);
      const startTime = Math.round(date.valueOf() / 1000);

      route.splits.push({ index: startTime - route.zerotime });

      runner.legs.forEach((leg) => {
        route.splits.push({
          index: startTime + leg.timeOverall - route.zerotime,
        });
      });

      route.manualsplits = 1;
    }
  });

  document.getElementById("shown").click();
}
