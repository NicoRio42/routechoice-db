import admin from "firebase-admin";

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

async function addFinishControlToLeg() {
  const db = admin.firestore();
  const batch = db.batch();

  const courseDataCollection = await db.collection("coursesData").get();

  courseDataCollection.forEach((courseDoc) => {
    const legs = structuredClone(courseDoc.data().legs);

    legs.forEach((leg) => {
      const finishControl = courseDoc
        .data()
        .course.find((control) => control.code === leg.finishControlCode);

      if (finishControl === undefined)
        throw new Error("Finish control not found");

      leg.finishLat = finishControl.lat;
      leg.finishLon = finishControl.lon;
    });

    batch.update(courseDoc.ref, { legs });
  });

  batch.commit();
}

addFinishControlToLeg();
