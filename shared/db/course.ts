import { doc, Firestore, getDoc } from "firebase/firestore/lite";

export async function getCourse(courseID: string, db: Firestore) {
  const docSnap = await getDoc(doc(db, "courses", courseID));

  return docSnap.data();
}
