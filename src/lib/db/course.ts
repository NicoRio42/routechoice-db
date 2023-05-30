import { doc, Firestore, getDoc } from "firebase/firestore/lite";
import { courseValidator } from "../models/course";
import type { Course } from "../models/course";

export async function getCourse(
  courseID: string,
  db: Firestore
): Promise<Course> {
  const docSnap = await getDoc(doc(db, "courses", courseID));

  const course = courseValidator.parse({ ...docSnap.data(), id: courseID });

  return course;
}
