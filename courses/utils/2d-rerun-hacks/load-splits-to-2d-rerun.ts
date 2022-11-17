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

    route.splits.push({ index: runner.startTime - route.zerotime });

    runner.legs.forEach((leg) => {
      route.splits.push({
        index:
          leg === null
            ? null
            : runner.startTime + leg.timeOverall - route.zerotime,
      });
    });

    route.manualsplits = 1;
  });

  // @ts-ignore
  document.getElementById("shown").click();
}
