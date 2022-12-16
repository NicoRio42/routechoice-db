import admin from "firebase-admin";

import serviceAccountDev from "./routechoice-db-dev-firebase-adminsdk.json" assert { type: "json" };
import serviceAccountProd from "./routechoice-db-firebase-adminsdk.json" assert { type: "json" };
import serviceAccountStaging from "./routechoice-db-staging-firebase-adminsdk.json" assert { type: "json" };

const env = process.argv[2];
const email = process.argv[3];

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

async function grantAdminRole(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });
  } catch (e) {
    console.error(e);
  }
}

grantAdminRole(email);
