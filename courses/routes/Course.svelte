<script lang="ts">
  import ActionButtons from "../components/ActionButtons.svelte";
  import SideBar from "../components/SideBar.svelte";
  import courseData from "../stores/course";
  import { onMount } from "svelte";
  import initMapviewer, {
    getLoggatorDataURL,
  } from "../utils/2d-rerun-hacks/init-mapviewer";
  import { getCourse } from "../../shared/db/course";
  import { getFirestore } from "firebase/firestore/lite";
  import buildCourseAndRoutechoices from "../utils/2d-rerun-hacks/build-course-and-routechoices";
  import selectedLeg from "../stores/selected-leg";
  import { selectHack } from "../utils/2d-rerun-hacks/select-hack";
  import ZoomButtons from "../components/ZoomButtons.svelte";
  import NavBar from "../../shared/NavBar.svelte";
  import NavbarButtons from "../components/NavbarButtons.svelte";
  import { loadSplitsTo2dRerun } from "../utils/2d-rerun-hacks/load-splits-to-2d-rerun";
  import is2DRerunLoaded from "../stores/rerun-2d-loaded";
  import type { Course } from "../../shared/models/course";

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

      if ($course?.courseAndRoutechoices !== undefined) {
        $selectedLeg = 1;
      }

      if ($course?.splitTimes !== undefined) {
        loadSplitsTo2dRerun($course.splitTimes);
      }
    });

    try {
      course = await getCourse(params.courseID, db);
    } catch (error) {
      alert("An error occured while loading the course.");
      return;
    }

    const loggatorPing = await fetch(
      getLoggatorDataURL(course.liveProviderURL)
    );

    if (loggatorPing) $course.id = params.courseID;

    initMapviewer($course.twoDRerunUrl);

    if ($course?.courseAndRoutechoices === undefined) return;

    buildCourseAndRoutechoices($course.courseAndRoutechoices);
  }
</script>

<svelte:head>
  <title>{$course?.name ?? "Routechoice DB course"}</title>
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
