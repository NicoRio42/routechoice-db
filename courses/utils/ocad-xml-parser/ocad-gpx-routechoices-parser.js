function gpxRoutechoicesExportTo2DRerunJson(routechoicesXmlDoc) {
  return Array.from(routechoicesXmlDoc.querySelectorAll("trk")).map((trk) => {
    const rawPoints = Array.from(trk.querySelectorAll("trkpt")).map(
      (trkpt) => ({
        lat: trkpt.getAttribute("lat"),
        lon: trkpt.getAttribute("lon"),
      })
    );

    const points = rawPoints.map((point) => `${point.lat},${point.lon}`);

    const pointsxy = rawPoints.map((point, index) => {
      const pt = mapviewer.map.toxy(point.lat, point.lon);

      return `${pt.x},${pt.y},${index * 3},0`;
    });

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
      x: 699.0649944867542,
      y: 412.40048355447203,
      length: 385.86708243200695,
      name: "B",
      description: "",
      color: "005500",
    };
  });
}

export default gpxRoutechoicesExportTo2DRerunJson;
