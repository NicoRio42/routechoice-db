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
  import { isUserAdminStore } from "../../shared/stores/user-store";
  import { courseValidator } from "../../shared/models/course";
  import NavBar from "../../shared/NavBar.svelte";
  import { getMapCalibrationFromCalString } from "../../shared/o-utils/map/coords-converter";
  import { rerun2DEventDataSchema } from "../../shared/o-utils/models/2d-rerun/get-2d-rerun-data-response";
  import { courseDataWithoutRunnersValidator } from "../../shared/o-utils/models/course-data";
  import { parseNestedArraysInLegs } from "../../shared/o-utils/models/leg";
  import type Runner from "../../shared/o-utils/models/runner";
  import { runnerValidator } from "../../shared/o-utils/models/runner";
  import mapCourseAndRoutechoicesTo2DRerun from "../../shared/o-utils/two-d-rerun/course-mappers";
  import ActionButtons from "../components/ActionButtons.svelte";
  import NavbarButtons from "../components/NavbarButtons/NavbarButtons.svelte";
  import SideBar from "../components/SideBar.svelte";
  import ZoomButtons from "../components/ZoomButtons.svelte";
  import course from "../stores/course";
  import courseData from "../stores/course-data";
  import is2DRerunLoaded from "../stores/rerun-2d-loaded";
  import selectedLeg from "../stores/selected-leg";
  import buildCourseAndRoutechoices from "../utils/2d-rerun-hacks/build-course-and-routechoices";
  import initMapviewer, {
    extractLoggatorIDFromLoggatorURL,
  } from "../utils/2d-rerun-hacks/init-mapviewer";
  import { loadRunnersSplitsTo2dRerun } from "../utils/2d-rerun-hacks/load-splits-to-2d-rerun";
  import { selectHack } from "../utils/2d-rerun-hacks/select-hack";

  export let params: { courseID: string };

  const db = getFirestore();

  initCourse();

  $: {
    if ($selectedLeg !== null) {
      selectHack("selectmode", "analyzecourse");
      document.getElementById(`ac-${$selectedLeg}`)?.click();
    }
  }

  async function initCourse() {
    // Custom event emitted from 2DRerun.js
    document.addEventListener("twoDRerunloaded", () => {
      $is2DRerunLoaded = true;

      if ($courseData?.course.length !== 0) {
        $selectedLeg = 1;
      }

      if ($courseData?.runners.length !== 0) {
        loadRunnersSplitsTo2dRerun($courseData.runners);
      }
    });

    try {
      const docSnap = await getDoc(doc(db, "courses", params.courseID));

      $course = courseValidator.parse({
        ...docSnap.data(),
        id: params.courseID,
      });

      const courseDataRef = await getDoc(doc(db, "coursesData", $course.data));
      const legs = courseDataRef.data()?.legs;

      if (legs === undefined) return;

      const courseDataWithoutRunners = courseDataWithoutRunnersValidator.parse({
        ...courseDataRef.data(),
        legs: parseNestedArraysInLegs(legs),
      });

      const runnersRef = collection(db, "coursesData", $course.data, "runners");
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
        $course.liveProviderURL
      )}`
    );

    const loggatorEventJSON = await loggatorEventRequest.json();
    const loggatorEventStarted = loggatorEventJSON.routes.length > 0;

    if (!loggatorEventStarted) return;

    const loggatorEvent = rerun2DEventDataSchema.parse(loggatorEventJSON);

    $courseData.map = {
      calibration: getMapCalibrationFromCalString(loggatorEvent.map.calstring),
      url: loggatorEvent.map.imagelink,
    };

    initMapviewer($course.liveProviderURL);

    if ($courseData.course.length === 0) return;

    const twoDRerunCourseAndRoutechoices = mapCourseAndRoutechoicesTo2DRerun(
      $courseData.legs,
      $courseData.course,
      $courseData.map.calibration
    );

    buildCourseAndRoutechoices(twoDRerunCourseAndRoutechoices);
  }
</script>

<svelte:head>
  <title>{$courseData?.name ?? "Routechoice DB course"}</title>
</svelte:head>

<div class="navbar-wrapper">
  <NavBar>
    {#if $isUserAdminStore}
      <NavbarButtons />
    {/if}
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
