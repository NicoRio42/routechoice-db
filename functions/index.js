import functions from "firebase-functions";
import fetch from "node-fetch";

export const getLoggatorData = functions.https.onRequest(async (req, res) => {
  fetch(req.body.text)
    .then((response) => response.json())
    .then((data) => res.json(data))
    .catch((error) => error);
});

export const getTractracInfo = functions.https.onRequest(async (req, res) => {
  const url = new URL(
    "https://em.event.tractrac.com/race_status/get_info.json"
  );

  for (let key in req.query) {
    url.searchParams.append(key, req.query[key]);
  }

  fetch(url.toString(), {
    headers: {
      Referer: "http://3drerun.worldofo.com/",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((data) => res.send(data));
});

export const getTractracData = functions.https.onRequest(async (req, res) => {
  const url = new URL("http://em.event.tractrac.com/race_status/get_data.json");

  for (let key in req.query) {
    url.searchParams.append(key, req.query[key]);
  }

  fetch(url.toString(), {
    headers: {
      Referer: "http://3drerun.worldofo.com/",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((data) => res.send(data));
});

export const getLiveServerTime = functions.https.onRequest(async (req, res) => {
  const url = new URL("http://3drerun.worldofo.com/live/time.php");

  for (let key in req.query) {
    url.searchParams.append(key, req.query[key]);
  }

  fetch(url.toString(), {
    headers: {
      Referer: "http://3drerun.worldofo.com/",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((data) => res.send(data));
});
