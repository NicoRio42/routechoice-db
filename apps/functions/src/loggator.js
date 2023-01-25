import functions from "firebase-functions";

const regionalFunctions = functions.region("europe-west1");

export const getLoggatorEvent = regionalFunctions.https.onCall(
  async (eventID) => {
    try {
      return await (
        await fetch(`https://events.loggator.com/api/events/${eventID}`)
      ).json();
    } catch (error) {
      return {
        message: "An error occured while loading event from Loggator API",
        error,
      };
    }
  }
);

export const getLoggatorEventPoints = regionalFunctions.https.onCall(
  async (eventID) => {
    try {
      return await (
        await fetch(`https://events.loggator.com/api/events/${eventID}/points`)
      ).json();
    } catch (error) {
      return {
        message:
          "An error occured while loading event points from Loggator API",
        error,
      };
    }
  }
);
