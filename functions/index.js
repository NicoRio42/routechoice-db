import functions from "firebase-functions";
import admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();
const regionalFunctions = functions.region("europe-west1");

export const createUserWithRole = regionalFunctions.https.onCall(
  async (data, context) => {
    if (context.auth.token.admin !== true) {
      return {
        error:
          "Request not authorized. User must be a admin to create a new user.",
      };
    }

    const { displayName, email, password, isAdmin } = data;

    try {
      const userRecord = await admin
        .auth()
        .createUser({ displayName, email, password });

      if (isAdmin)
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

      return {
        result: `User ${displayName} created.`,
      };
    } catch (error) {
      return {
        error: "An error occured while creating the user.",
      };
    }
  }
);

export const getGPSSeurantaInit = regionalFunctions.https.onRequest(
  async (req, res) => {
    const url = `http://3drerun.worldofo.com/xgps/${req.query.GPSSeurentaID}/init.txt`;

    res.set("Access-Control-Allow-Origin", "*");

    fetch(url.toString())
      .then((response) => response.text())
      .then((data) => res.send(data))
      .catch((error) => res.json(error));
  }
);

export const getGPSSeurantaData = regionalFunctions.https.onRequest(
  async (req, res) => {
    const url = `http://3drerun.worldofo.com/xgps/${req.query.GPSSeurentaID}/`;

    res.set("Access-Control-Allow-Origin", "*");

    fetch(url.toString())
      .then((response) => response.text())
      .then((data) => res.send(data))
      .catch((error) => res.json(error));
  }
);

export const getLoggatorData = regionalFunctions.https.onRequest(
  async (req, res) => {
    const url = new URL("http://loggator2.worldofo.com/getseu_json.php");

    url.searchParams.append("baseurl", req.query.baseurl);
    url.searchParams.append("idstr", req.query.idstr);

    res.set("Access-Control-Allow-Origin", "*");

    fetch(url.toString())
      .then((response) => response.json())
      .then((data) => res.json(data))
      .catch((error) => res.json(error));
  }
);

export const getTractracInfo = regionalFunctions.https.onRequest(
  async (req, res) => {
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
      .then((data) => res.send(data))
      .catch((error) => res.json(error));
  }
);

export const getTractracData = regionalFunctions.https.onRequest(
  async (req, res) => {
    const url = new URL(
      "http://em.event.tractrac.com/race_status/get_data.json"
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
      .then((data) => res.send(data))
      .catch((error) => res.json(error));
  }
);

export const getLiveServerTime = regionalFunctions.https.onRequest(
  async (req, res) => {
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
      .then((data) => res.send(data))
      .catch((error) => res.json(error));
  }
);

export const getWinsplitData = regionalFunctions.https.onRequest(
  async (req, res) => {
    const url = new URL("http://loggator2.worldofo.com/loadwinsplits.php");

    for (let key in req.query) {
      url.searchParams.append(key, req.query[key]);
    }

    res.set("Access-Control-Allow-Origin", "*");

    fetch(url.toString())
      .then((response) => response.text())
      .then((data) => res.send(data))
      .catch((error) => res.json(error));
  }
);
