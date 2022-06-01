<script>
  import ActionButtons from "../components/ActionButtons.svelte";
  import SideBar from "../components/SideBar.svelte";
  import course from "../stores/course";
  import { onMount } from "svelte";
  import initMapviewer from "../utils/2d-rerun-hacks/init-mapviewer";
  import { getCourse } from "../../shared/db/course";
  import { getFirestore } from "firebase/firestore/lite";

  export let params = {};

  const db = getFirestore();

  onMount(initCourse);

  async function initCourse() {
    $course = await getCourse(params.courseID, db);
    initMapviewer($course.twoDRerunUrl);

    if ($course.courseAndRoutechoices === undefined) {
      return;
    }
  }
</script>

<SideBar />

<ActionButtons />
