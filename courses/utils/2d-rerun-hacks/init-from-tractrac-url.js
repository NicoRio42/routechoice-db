export function initFromTractracURL(tractracURL) {
  const { eventID, raceID } = extractEventDataFromTractracURL(tractracURL);

  mapviewer.IsLive = 1;
  mapviewer.liveprovider = "tractrac";
  mapviewer.liveid = "d432b550-b4a9-013a-1a7f-60a44ce903c3";
  mapviewer.liveiniturl = `https://europe-west1-routechoice-db-dev.cloudfunctions.net/getTractracInfo?eventid=${eventID}&raceid=${raceID}`;
  mapviewer.livedataurl = `https://europe-west1-routechoice-db-dev.cloudfunctions.net/getTractracData?eventid=${eventID}&raceid=${raceID}`;
  mapviewer.livedelay = "60";
  mapviewer.liveupdate = 100000;
  mapviewer.liveformat = "jsonp";
  var ids = new Array();
  mapviewer.initLive(1);
}

function extractEventDataFromTractracURL(tractracURL) {
  const eventID = tractracURL.split("/events/")[1].split("/races/")[0];

  const raceString = tractracURL.split("/events/")[1].split("/races/")[1];
  const raceID = raceString.substring(0, raceString.length - 5);

  return { eventID, raceID };
}

("https://live.tractrac.com/viewer/index.html?target=https://em.event.tractrac.com/events/d1131c20-76c1-013a-bc67-60a44ce903c3/races/ee8ee5f0-b294-013a-1007-60a44ce903c3.json");
