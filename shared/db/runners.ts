import {
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore/lite";

import type Runner from "../o-utils/models/runner";

export function updateRunnersInFirestore(
  db: Firestore,
  previousRunners: Runner[],
  newRunners: Runner[],
  courseId: string
) {
  const updatedRunnersIDs: string[] = [];

  newRunners.forEach(async (runner) => {
    const runnerToUpdate = previousRunners.find(
      (r) => r.firstName === runner.firstName && r.lastName === runner.lastName
    );

    if (runnerToUpdate === undefined) {
      runner.foreignKeys.firestoreRunnerID;

      await setDoc(
        doc(db, "coursesData", courseId, "runners", runner.id),
        runner
      );

      console.log(`New runner ${runner.firstName} ${runner.lastName} created`);

      return;
    }

    updatedRunnersIDs.push(runnerToUpdate.id);
    runner.id = runnerToUpdate.id;

    await updateDoc(
      doc(db, "coursesData", courseId, "runners", runnerToUpdate.id),
      { ...runner }
    );

    console.log(`Runner ${runner.firstName} ${runner.lastName} updated`);

    previousRunners.forEach(async (r) => {
      if (updatedRunnersIDs.includes(r.id)) return;

      await deleteDoc(doc(db, "coursesData", courseId, "runners", r.id));

      console.log(`Runner ${runner.firstName} ${runner.lastName} deleted`);
    });
  });
}

export function deleteAllRunners(
  db: Firestore,
  courseId: string,
  runners: Runner[]
) {
  runners.forEach(async (runner) => {
    await deleteDoc(doc(db, "coursesData", courseId, "runners", runner.id));
  });
}
