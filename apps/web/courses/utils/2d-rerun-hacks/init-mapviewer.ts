import { functionsBaseURL } from "../../../environments/environment";

function initMapviewer(urlString) {
  const url = new URL(urlString);

  if (url.origin === "https://events.loggator.com") {
    initFromLoggatorURL(urlString);
  }

  if (url.origin === "https://live.tractrac.com/viewer/index.html") {
    initFromTractracURL(urlString);
  }
}

function initFromLoggatorURL(loggatorURL) {
  mapviewer.loadseu(
    "http://www.tulospalvelu.fi/gps/",
    `logatec${extractLoggatorIDFromLoggatorURL(loggatorURL)}`
  );
}

export function getLoggatorDataURL(logatorUrl: string): string {
  return `${functionsBaseURL}/getLoggatorData?baseurl=http://www.tulospalvelu.fi/gps/&idstr=logatec${extractLoggatorIDFromLoggatorURL(
    logatorUrl
  )}`;
}

export function extractLoggatorIDFromLoggatorURL(logatorUrl: string) {
  const urlArray = logatorUrl.split("/");
  return urlArray[urlArray.length - 1];
}

function initFromTractracURL(tractracURL) {
  const { eventID, raceID } = extractEventDataFromTractracURL(tractracURL);

  mapviewer.IsLive = 1;
  mapviewer.liveprovider = "tractrac";
  mapviewer.liveid = "d432b550-b4a9-013a-1a7f-60a44ce903c3";
  mapviewer.liveiniturl = `${functionsBaseURL}/getTractracInfo?eventid=${eventID}&raceid=${raceID}`;
  mapviewer.livedataurl = `${functionsBaseURL}/getTractracData?eventid=${eventID}&raceid=${raceID}`;
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

export default initMapviewer;
