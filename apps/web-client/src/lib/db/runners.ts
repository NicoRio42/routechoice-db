import { doc, writeBatch, type Firestore } from "firebase/firestore/lite";
import type Runner from "../../shared/o-utils/models/runner";

export function updateRunnersRoutechoicesInFirestore(
  oldRunners: Runner[],
  newRunners: Runner[],
  db: Firestore,
  courseId: string
) {
  // So the runner track is not persisted to Firebase
  const runnersWithDetectedRoutechoicesWithoutTrack = newRunners.map(
    (runner) => ({
      ...runner,
      track: null,
    })
  );

  // Only updated runners are pushed to Firestore
  const updatedRunner = runnersWithDetectedRoutechoicesWithoutTrack.filter(
    (newRunner, runnerIndex) =>
      oldRunners[runnerIndex].legs.some((oldRunnerLeg, legIndex) => {
        return (
          newRunner.legs[legIndex]?.detectedRouteChoice?.id !==
          oldRunnerLeg?.detectedRouteChoice?.id
        );
      })
  );

  const batch = writeBatch(db);

  updatedRunner.forEach(async (runner) => {
    batch.update(doc(db, "coursesData", courseId, "runners", runner.id), {
      legs: runner.legs,
    });
  });

  batch.commit();
}
