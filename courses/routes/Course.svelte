<script lang="ts">
  import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    type DocumentReference,
  } from "firebase/firestore/lite";
  import { getDoc, getFirestore } from "firebase/firestore/lite";
  import type CourseData from "../../shared/o-utils/models/course-data";
  import type Runner from "../../shared/o-utils/models/runner";
  import { runnerValidator } from "../../shared/o-utils/models/runner";
  import { onMount } from "svelte";
  import { getCourse } from "../../shared/db/course";
  import { courseValidator, type Course } from "../../shared/models/course";
  import NavBar from "../../shared/NavBar.svelte";
  import { courseDataWithoutRunnersValidator } from "../../shared/o-utils/models/course-data";
  import ActionButtons from "../components/ActionButtons.svelte";
  import NavbarButtons from "../components/NavbarButtons.svelte";
  import SideBar from "../components/SideBar.svelte";
  import ZoomButtons from "../components/ZoomButtons.svelte";
  import courseData from "../stores/course";
  import is2DRerunLoaded from "../stores/rerun-2d-loaded";
  import selectedLeg from "../stores/selected-leg";
  import buildCourseAndRoutechoices from "../utils/2d-rerun-hacks/build-course-and-routechoices";
  import initMapviewer, {
    extractLoggatorIDFromLoggatorURL,
  } from "../utils/2d-rerun-hacks/init-mapviewer";
  import { loadSplitsTo2dRerun } from "../utils/2d-rerun-hacks/load-splits-to-2d-rerun";
  import { selectHack } from "../utils/2d-rerun-hacks/select-hack";

  export let params: { courseID: string };
  let course: Course;

  const db = getFirestore();

  onMount(initCourse);

  $: {
    if ($selectedLeg) {
      selectHack("selectmode", "analyzecourse");
      document.getElementById(`ac-${$selectedLeg}`)?.click();
    }
  }

  async function initCourse() {
    // Custom event emitted from 2DRerun.js
    document.addEventListener("twoDRerunloaded", () => {
      $is2DRerunLoaded = true;

      if ($courseData.course.length !== 0) {
        $selectedLeg = 1;
      }

      if ($courseData.runners.length !== 0) {
        loadSplitsTo2dRerun($courseData.runners);
      }
    });

    try {
      const docSnap = await getDoc(doc(db, "courses", params.courseID));

      course = courseValidator.parse({
        ...docSnap.data(),
        id: params.courseID,
      });

      const courseDataRef = await getDoc(
        course.data as DocumentReference<CourseData>
      );

      const courseDataWithoutRunners = courseDataWithoutRunnersValidator.parse(
        courseDataRef.data()
      );

      const runnersRef = collection(
        course.data as DocumentReference<CourseData>,
        "runners"
      );
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

      $courseData = { ...courseDataWithoutRunners, runners };
    } catch (error) {
      console.error(error);
      alert(`An error occured while loading the course.`);
      return;
    }

    // Check if loggator event has started, and if the map is available
    const loggatorEventRequest = await fetch(
      `https://europe-west1-routechoice-db-dev.cloudfunctions.net/getLoggatorData?baseurl=http://www.tulospalvelu.fi/gps/&idstr=logatec${extractLoggatorIDFromLoggatorURL(
        course.liveProviderURL
      )}`
    );

    const loggatorEvent = await loggatorEventRequest.json();
    const loggatorEventStarted = loggatorEvent.routes.length > 0;

    if (!loggatorEventStarted) return;

    initMapviewer(course.liveProviderURL);

    if ($courseData.course.length === 0) return;

    buildCourseAndRoutechoices($courseData.course);
  }
</script>

<svelte:head>
  <title>{$courseData?.name ?? "Routechoice DB course"}</title>
</svelte:head>

<div class="navbar-wrapper">
  <NavBar>
    <NavbarButtons />
  </NavBar>
</div>

<ZoomButtons />

<SideBar />

<ActionButtons />

<style>
  .navbar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 11;
  }
</style>
