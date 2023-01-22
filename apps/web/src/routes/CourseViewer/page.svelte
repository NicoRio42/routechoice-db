<script lang="ts">
  import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
  } from "firebase/firestore/lite";
  import { courseDataWithoutRunnersValidator } from "../../../shared/o-utils/models/course-data";
  import { parseNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import { courseValidator } from "../../../shared/models/course";
  import type Runner from "../../../shared/o-utils/models/runner";
  import { runnerValidator } from "../../../shared/o-utils/models/runner";
  import { functionsBaseURL } from "../../../environments/environment";
  import { rerun2DEventDataSchema } from "../../../shared/o-utils/models/2d-rerun/get-2d-rerun-data-response";
  import type CourseData from "../../../shared/o-utils/models/course-data";
  import type { Course } from "../../../shared/models/course";
  import { extractLoggatorIDFromLoggatorURL } from "../../../courses/utils/2d-rerun-hacks/init-mapviewer";
  import { getMapCalibrationFromCalString } from "../../../shared/o-utils/map/coords-converter";
  import CourseViewer from "./CourseViewer.svelte";

  export let params: { courseId: string };

  const db = getFirestore();

  const courseDataPromise = getCourseData();

  async function getCourseData(): Promise<CourseData | undefined> {
    let course: Course;
    let courseData: CourseData;
    try {
      const docSnap = await getDoc(doc(db, "courses", params.courseId));

      course = courseValidator.parse({
        ...docSnap.data(),
        id: params.courseId,
      });

      const courseDataRef = await getDoc(doc(db, "coursesData", course.data));
      const legs = courseDataRef.data()?.legs;

      if (legs === undefined) return;

      const courseDataWithoutRunners = courseDataWithoutRunnersValidator.parse({
        ...courseDataRef.data(),
        legs: parseNestedArraysInLegs(legs),
      });

      const runnersRef = collection(db, "coursesData", course.data, "runners");
      const q = query(runnersRef, orderBy("rank", "desc"));

      const querySnapshot = await getDocs(q);
      const runners: Runner[] = [];

      querySnapshot.forEach((doc) => {
        try {
          runners.push(runnerValidator.parse({ ...doc.data(), id: doc.id }));
        } catch (error) {
          console.error(error);
        }
      });

      courseData = { ...courseDataWithoutRunners, runners };
    } catch (error) {
      console.error(error);
      alert(`An error occured while loading the course.`);

      return;
    }

    // Check if loggator event has started, and if the map is available
    const loggatorEventRequest = await fetch(
      `${functionsBaseURL}/getLoggatorData?baseurl=http://www.tulospalvelu.fi/gps/&idstr=logatec${extractLoggatorIDFromLoggatorURL(
        course.liveProviderURL
      )}`
    );

    const loggatorEventJSON = await loggatorEventRequest.json();
    const loggatorEventStarted = loggatorEventJSON.routes.length > 0;

    if (!loggatorEventStarted) {
      alert("Event isn't started yet.");
      return;
    }

    const loggatorEvent = rerun2DEventDataSchema.parse(loggatorEventJSON);

    courseData.map = {
      calibration: getMapCalibrationFromCalString(loggatorEvent.map.calstring),
      url: loggatorEvent.map.imagelink,
    };

    return courseData;
  }
</script>

{#await courseDataPromise}
  Loading...
{:then courseData}
  {#if courseData !== undefined}
    <CourseViewer {courseData} />
  {:else}
    An error occured
  {/if}
{:catch error}
  An error occured
{/await}
