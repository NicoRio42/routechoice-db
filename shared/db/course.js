import { doc, getDoc } from "firebase/firestore/lite";

/**
 * Get a single course from Firestore
 * @param {number} courseID Firestore course document ID
 * @param db Firestore db reference
 * @returns
 */
export async function getCourse(courseID, db) {
  const docSnap = await getDoc(doc(db, "courses", courseID)).catch(() =>
    alert("An error occured while loading the course.")
  );

  return docSnap.data();
}
