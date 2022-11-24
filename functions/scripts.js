import admin from "firebase-admin";

import serviceAccount from "./routechoice-db-dev-firebase-adminsdk.json" assert { type: "json" };

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

grantAdminRole("nicolas.rio42@gmail.com");
