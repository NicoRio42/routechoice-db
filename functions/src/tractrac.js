import functions from "firebase-functions";
import fetch from "node-fetch";
import { createURLWithRequestQueryParams } from "./utils.js";

const regionalFunctions = functions.region("europe-west1");

export const getTractracInfo = regionalFunctions.https.onRequest(
  async (req, res) => {
    let url;

    try {
      url = createURLWithRequestQueryParams(
        req,
        "https://em.event.tractrac.com/race_status/get_info.json"
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

      const data = await response.json();
      res.send(data);
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

export const getTractracData = regionalFunctions.https.onRequest(
  async (req, res) => {
    let url;

    try {
      url = createURLWithRequestQueryParams(
        req,
        "http://em.event.tractrac.com/race_status/get_data.json"
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

      const data = await response.json();
      res.send(data);
    } catch (error) {
      res.status(400).json(error);
    }
  }
);
