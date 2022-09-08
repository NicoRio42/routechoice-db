function gpxRoutechoicesExportTo2DRerunJson(routechoicesXmlDoc) {
  const rawRoutechoices = Array.from(
    routechoicesXmlDoc.querySelectorAll("trk")
  ).map((trk) => {
    const rawPoints = Array.from(trk.querySelectorAll("trkpt")).map(
      (trkpt) => ({
        lat: trkpt.getAttribute("lat"),
        lon: trkpt.getAttribute("lon"),
      })
    );

    const pointsString = rawPoints
      .map((point) => `${point.lat}${point.lon}`)
      .join("");

    const name = trk.querySelector("name").textContent;

    return { rawPoints, pointsString, name };
  });

  const filteredRoutechoices = rawRoutechoices.filter((route, index) =>
    rawRoutechoices
      .slice(0, index)
      .every(
        (previousRoutes) => previousRoutes.pointsString !== route.pointsString
      )
  );

  return filteredRoutechoices.map((routeChoice) => {
    const rawPoints = routeChoice.rawPoints;
    const points = rawPoints.map((point) => `${point.lat},${point.lon}`);

    const pointsxy = rawPoints.map((point, index) => {
      const pt = mapviewer.map.toxy(point.lat, point.lon);

      return `${pt.x},${pt.y},${index * 3},0`;
    });

    const length = rawPoints.reduce((previous, current, index) => {
      if (index === rawPoints.length - 1) {
        return previous;
      }

      return (
        previous +
        calcdistance(
          current.lat,
          current.lon,
          rawPoints[index + 1].lat,
          rawPoints[index + 1].lon
        )
      );
    }, 0);

    const lastPoint = rawPoints[rawPoints.length - 1];
    const { x, y } = mapviewer.map.toxy(lastPoint.lat, lastPoint.lon);

    return {
      type: "route",
      opened_dialog: 0,
      ready_for_dialog: 0,
      runnername: "Route",
      points,
      pointsxy,
      currenttime: 36,
      currentalt: 0,
      totalup: 0,
      show: 1,
      offsettxt_x: 0,
      offsettxt_y: 0,
      offsettxt_basex: 0,
      offsettxt_basey: 0,
      group: 0,
      x,
      y,
      length,
      name: routeChoice.name,
      description: "",
      color: Math.floor(Math.random() * 16777215).toString(16),
    };
  });
}

export default gpxRoutechoicesExportTo2DRerunJson;
