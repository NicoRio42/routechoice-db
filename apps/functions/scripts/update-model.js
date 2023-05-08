import admin from "firebase-admin";
import { randomUUID } from "crypto";

import serviceAccountDev from "./routechoice-db-dev-firebase-adminsdk.json" assert { type: "json" };
import serviceAccountProd from "./routechoice-db-firebase-adminsdk.json" assert { type: "json" };
import serviceAccountStaging from "./routechoice-db-staging-firebase-adminsdk.json" assert { type: "json" };

const env = process.argv[2];

let serviceAccount;

switch (env) {
  case "prod": {
    serviceAccount = serviceAccountProd;
    break;
  }
  case "dev": {
    serviceAccount = serviceAccountDev;
    break;
  }
  case "staging": {
    serviceAccount = serviceAccountStaging;
    break;
  }
  default: {
    throw new Error("Wrong env argument");
  }
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  }),
});

/**
 * Convert routechoices id's to string and add # in front of hex colors
 * in legs and runners
 */
async function modifyRoutechoiceModel() {
  const db = admin.firestore();
  const batch = db.batch();

  const courseDataCollection = await db.collection("coursesData").get();
  let count = 0;

  let courseIndex = 0;
  courseDataCollection.forEach(async (courseDoc) => {
    /** @type {import("orienteering-js/models").Leg[]} */
    const legs = structuredClone(courseDoc.data().legs);

    const runnersCollection = await db
      .collection(`coursesData/${courseDoc.id}/runners`)
      .get();

    runnersCollection.forEach((runnerDoc) => {
      /** @type {import("orienteering-js/models").RunnerLeg[]} */
      const runnerLegs = structuredClone(runnerDoc.data().legs);
      let shouldUpdateRunner = false;

      runnerLegs.forEach((runnerLeg, runnerLegindex) => {
        if (runnerLeg === null) return;

        const detectedRouteChoice = runnerLeg.detectedRouteChoice;

        if (detectedRouteChoice !== null) {
          const correspondingRoutechoice = legs[
            runnerLegindex
          ].routechoices.find((r) => r.name === detectedRouteChoice.name);

          if (correspondingRoutechoice !== undefined) {
            detectedRouteChoice.id = correspondingRoutechoice.id;
            shouldUpdateRunner = true;
          }
        }

        const manualRouteChoice = runnerLeg.manualRouteChoice;

        if (manualRouteChoice !== null) {
          const correspondingRoutechoice = legs[
            runnerLegindex
          ].routechoices.find((r) => r.name === manualRouteChoice.name);

          if (correspondingRoutechoice !== undefined) {
            manualRouteChoice.id = correspondingRoutechoice.id;
            shouldUpdateRunner = true;
          }
        }
      });

      if (shouldUpdateRunner) {
        batch.update(runnerDoc.ref, { legs: runnerLegs });
        count++;
      }
    });

    console.log(courseDataCollection.size, courseIndex + 1, count);
    if (courseDataCollection.size === courseIndex + 1) batch.commit();

    courseIndex++;
  });
}

modifyRoutechoiceModel();
