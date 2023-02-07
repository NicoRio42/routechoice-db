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
  import { getFunctions, httpsCallable } from "firebase/functions";
  import Logo from "../../../shared/icons/Logo.svelte";
  import type { LoggatorPoints } from "src/models/loggator-api/loggator-points";
  import type { Course } from "../../../shared/models/course";
  import { courseValidator } from "../../../shared/models/course";
  import getMapCallibrationFromLoggatorEventMap from "../../../shared/o-utils/loggator/map-calibration";
  import { buildRunnersTracksFromLoggatorData } from "../../../shared/o-utils/loggator/points";
  import type CourseData from "../../../shared/o-utils/models/course-data";
  import { courseDataWithoutRunnersValidator } from "../../../shared/o-utils/models/course-data";
  import { parseNestedArraysInLegs } from "../../../shared/o-utils/models/leg";
  import type Runner from "../../../shared/o-utils/models/runner";
  import { runnerValidator } from "../../../shared/o-utils/models/runner";
  import type { LoggatorEvent } from "../../models/loggator-api/loggator-event";
  import CourseViewer from "./CourseViewer.svelte";

  export let params: { courseId: string };

  const functions = getFunctions(undefined, "europe-west1");

  const getLoggatorEvent = httpsCallable<
    string,
    LoggatorEvent | { message: string; error: unknown }
  >(functions, "getLoggatorEvent");

  const getLoggatorEventPoints = httpsCallable<
    string,
    LoggatorPoints | { message: string; error: unknown }
  >(functions, "getLoggatorEventPoints");

  function isLoggatorPoints(
    data: LoggatorPoints | { message: string; error: unknown }
  ): data is LoggatorPoints {
    return "data" in data;
  }

  function isLoggatorEvent(
    data: LoggatorEvent | { message: string; error: unknown }
  ): data is LoggatorEvent {
    return !("error" in data);
  }

  const db = getFirestore();
  const courseDataPromise = getCourseData();

  async function getCourseData(): Promise<CourseData> {
    let course: Course;

    try {
      const loggatorEventID = params.courseId.split("-")[1];

      if (loggatorEventID === undefined)
        throw new Error("Wrong format for course id");

      const runnersRef = collection(
        db,
        "coursesData",
        params.courseId,
        "runners"
      );

      const runnersQuery = query(runnersRef, orderBy("rank", "desc"));

      const [
        courseDocument,
        courseDataDocument,
        runnersCollection,
        loggatorEventResponse,
        loggatorPointsResponse,
      ] = await Promise.all([
        getDoc(doc(db, "courses", params.courseId)),
        getDoc(doc(db, "coursesData", params.courseId)),
        getDocs(runnersQuery),
        getLoggatorEvent(loggatorEventID),
        getLoggatorEventPoints(loggatorEventID),
      ]);

      if (!isLoggatorEvent(loggatorEventResponse.data))
        throw new Error("Could not get loggator event");

      const loggatorEvent = loggatorEventResponse.data;

      if (!isLoggatorPoints(loggatorPointsResponse.data))
        throw new Error("Could not get loggator points");

      const loggatorPoints = loggatorPointsResponse.data.data;

      course = courseValidator.parse({
        ...courseDocument.data(),
        id: params.courseId,
      });

      const courseData = {
        ...courseDataWithoutRunnersValidator.parse({
          ...courseDataDocument.data(),
          legs: parseNestedArraysInLegs(courseDataDocument.data()?.legs),
        }),
        runners: [],
      };

      if (loggatorEvent.map.url === undefined)
        throw new Error("Event isn't started yet");

      if (courseData.legs.length === 0) return courseData;

      const courseDataWithoutRunners = courseDataWithoutRunnersValidator.parse({
        ...courseDataDocument.data(),
        legs: parseNestedArraysInLegs(courseDataDocument.data()?.legs),
      });

      const runners: Runner[] = [];

      runnersCollection.forEach((doc) => {
        try {
          runners.push(runnerValidator.parse({ ...doc.data(), id: doc.id }));
        } catch (error) {
          console.error(error);
        }
      });

      const runnersWithTracks = buildRunnersTracksFromLoggatorData(
        runners,
        loggatorPoints,
        loggatorEvent
      );

      const map = {
        calibration: await getMapCallibrationFromLoggatorEventMap(
          loggatorEvent.map
        ),
        url: loggatorEvent.map.url,
      };

      return {
        ...courseDataWithoutRunners,
        runners: runnersWithTracks,
        map,
      };
    } catch (error) {
      console.error(error);
    }
  }
</script>

{#await courseDataPromise}
  <div class="loading-wrapper">
    <Logo
      --bg-color="white"
      --width="10rem"
      --height="10rem"
      --logo-color="var(--primary)"
    />

    <p aria-busy="true">Loading</p>
  </div>
{:then courseData}
  <CourseViewer {courseData} />
{:catch error}
  An error occured
{/await}

<style>
  .loading-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .loading-wrapper p {
    color: var(--primary);
    font-weight: 500;
  }
</style>
