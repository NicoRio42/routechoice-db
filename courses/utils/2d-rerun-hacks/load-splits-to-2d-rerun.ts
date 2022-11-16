import type { Mapviewer } from "../../../shared/o-utils/models/2d-rerun/mapviewer";
import type Runner from "../../../shared/o-utils/models/Runner";

export function loadRunnersSplitsTo2dRerun(runners: Runner[]) {
  // @ts-ignore
  (mapviewer as Mapviewer).routes.forEach((route) => {
    const runner = runners.find(
      (runner) =>
        runner.foreignKeys.twoDRerunRouteIndexNumber === route.indexnumber
    );

    if (runner === undefined || runner.legs.length === 0) return;

    route.splits = [];

    const date = new Date(runner.startTime);
    const startTime = Math.round(date.valueOf() / 1000);

    route.splits.push({ index: startTime - route.zerotime });

    runner.legs.forEach((leg) => {
      route.splits.push({
        index:
          leg === null ? null : startTime + leg.timeOverall - route.zerotime,
      });
    });

    route.manualsplits = 1;
  });

  // @ts-ignore
  document.getElementById("shown").click();
}
