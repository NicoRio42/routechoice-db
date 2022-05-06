import functions from "firebase-functions";
import fetch from "node-fetch";

export const get2DRerunData = functions.https.onCall((data, context) => {
  return fetch(data)
    .then((response) => response.json())
    .catch((error) => error);
});
