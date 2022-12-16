import admin from "firebase-admin";
import functions from "firebase-functions";

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
        error: `An error occured while creating the user: ${error}`,
      };
    }
  }
);

export const getUserList = regionalFunctions.https.onCall(
  async (data, context) => {
    if (context.auth.token.admin !== true) {
      return {
        error: "Request not authorized. User must be a admin to get all users.",
      };
    }

    try {
      const userList = await admin.auth().listUsers();

      return userList.users.map((user) => ({
        id: user.uid,
        displayName: user.displayName,
        email: user.email,
        isAdmin: user.customClaims?.admin,
      }));
    } catch (error) {
      return {
        error: `An error occured while retreaving users: ${error}`,
      };
    }
  }
);

export const getUserListOnRequest = regionalFunctions.https.onRequest(
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Headers", "authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const authorizationHeader = req.get("authorization");

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      res.status(403).send("Unauthorized");
      return;
    }

    const idToken = authorizationHeader.split("Bearer ")[1];

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);

      if (!decodedIdToken.admin) {
        res.status(403).send("Unauthorized");
      }
      const userList = await admin.auth().listUsers();

      const userListForResponse = userList.users.map((user) => ({
        id: user.uid,
        displayName: user.displayName,
        email: user.email,
        isAdmin: user.customClaims?.admin,
      }));

      res.json(userListForResponse);
    } catch (error) {
      res.status(403).send("Unauthorized");
    }
  }
);

export const deleteUser = regionalFunctions.https.onCall(
  async (data, context) => {
    if (context.auth.token.admin !== true) {
      return {
        error: "Request not authorized. User must be a admin to delete users.",
      };
    }

    try {
      await admin.auth().deleteUser(data);

      return {
        result: `User with id ${data} deleted.`,
      };
    } catch (error) {
      return {
        error: `An error occured while retreaving users: ${error}`,
      };
    }
  }
);