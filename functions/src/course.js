import admin from "firebase-admin";
import functions from "firebase-functions";

const regionalFunctions = functions.region("europe-west1");

export const deleteCourse = regionalFunctions.https.onCall(
  async (course, context) => {
    if (context.auth.token.admin !== true) {
      return {
        error:
          "Request not authorized. User must be a admin to delete a course.",
      };
    }

    try {
      const db = admin.firestore();
      const batch = db.batch();

      const runnersCollectionSnapshot = await db
        .collection(`coursesData/${course.data}/runners`)
        .get();

      runnersCollectionSnapshot.forEach((runnerDocument) => {
        batch.delete(runnerDocument.ref);
      });

      const courseDataSnapshot = await db
        .doc(`coursesData/${course.data}`)
        .get();
      batch.delete(courseDataSnapshot.ref);

      const courseSnapshot = await db.doc(`courses/${course.id}`).get();
      batch.delete(courseSnapshot.ref);

      batch.commit();

      return { message: "Course deleted successfully." };
    } catch (error) {
      return { error };
    }
  }
);
