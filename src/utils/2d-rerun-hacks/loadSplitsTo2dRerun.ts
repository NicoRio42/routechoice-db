export const loadSplitsTo2dRerun = (splitsData, splitsOffset = 0) => {
  mapviewer.routes.forEach((route) => {
    let splits = splitsData.filter(
      (splits) =>
        splits.first_name + " " + splits.last_name === route.runnername
    );

    if (splits.length) {
      let date = new Date(splits[0].splits_routechoices_mistakes.startTime);
      let startTime = Math.round(date.valueOf() / 1000);

      // SplitTime for start
      route.splits.push({ index: startTime - route.zerotime + splitsOffset });

      // Rest of the splitTimes
      splits[0].splits_routechoices_mistakes.legs.forEach((leg) => {
        route.splits.push({
          index: startTime + leg.timeOverall - route.zerotime + splitsOffset,
        });
      });
      route.manualsplits = 1;
    }
  });
};
