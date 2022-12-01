import functions from "firebase-functions";
import fetch from "node-fetch";
import { createURLWithRequestQueryParams } from "./utils.js";

const regionalFunctions = functions.region("europe-west1");

export const getWinsplitData = regionalFunctions.https.onRequest(
  async (req, res) => {
    /** @type {URL} */
    let url;

    try {
      url = createURLWithRequestQueryParams(
        req,
        "http://loggator2.worldofo.com/loadwinsplits.php"
      );
    } catch (error) {
      res.status(403).send(error);
      return;
    }

    res.set("Access-Control-Allow-Origin", "*");

    try {
      const response = await fetch(url.toString());
      const data = await response.text();
      res.send(data);
    } catch (error) {
      res.status(400).json(error);
    }
  }
);
