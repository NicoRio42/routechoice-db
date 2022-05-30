export function initFromLoggatorURL(loggatorURL) {
  window.mapviewer.loadseu(
    "http://www.tulospalvelu.fi/gps/",
    `logatec${extractLoggatorIDFromLoggatorURL(loggatorURL)}`
  );
}

function extractLoggatorIDFromLoggatorURL(logatorUrl) {
  const urlArray = logatorUrl.split("/");
  return urlArray[urlArray.length - 1];
}
