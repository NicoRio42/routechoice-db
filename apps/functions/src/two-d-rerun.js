import functions from "firebase-functions";
import fetch from "node-fetch";
import { createURLWithRequestQueryParams } from "./utils.js";

const regionalFunctions = functions.region("europe-west1");

export const getGPSSeurantaInit = regionalFunctions.https.onRequest(
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    try {
      const response = await fetch(
        `http://3drerun.worldofo.com/xgps/${req.query.GPSSeurentaID}/init.txt`
      );

      const data = await response.text();
      res.send(data);
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

export const getGPSSeurantaData = regionalFunctions.https.onRequest(
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    try {
      const response = await fetch(
        `http://3drerun.worldofo.com/xgps/${req.query.GPSSeurentaID}/`
      );
      const data = await response.text();
      res.send(data);
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

export const getLoggatorData = regionalFunctions.https.onRequest(
  async (req, res) => {
    const url = new URL("http://loggator2.worldofo.com/getseu_json.php");

    if (
      typeof req.query.baseurl !== "string" ||
      typeof req.query.idstr !== "string"
    ) {
      res.status(403).send("Bad query string");
      return;
    }

    url.searchParams.append("baseurl", req.query.baseurl);
    url.searchParams.append("idstr", req.query.idstr);
    url.searchParams.append("clear", "1");

    res.set("Access-Control-Allow-Origin", "*");

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

export const getLiveServerTime = regionalFunctions.https.onRequest(
  async (req, res) => {
    let url;

    try {
      url = createURLWithRequestQueryParams(
        req,
        "http://3drerun.worldofo.com/live/time.php"
      );
    } catch (error) {
      res.status(403).send(error);
      return;
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Referer: "http://3drerun.worldofo.com/",
          "Content-Type": "application/javascript; charset=utf-8",
        },
      });

      const data = await response.text();
      res.send(data);
    } catch (error) {
      res.status(400).json(error);
    }
  }
);
