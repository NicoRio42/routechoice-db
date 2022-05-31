<script>
  import Router, { replace } from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";
  import NavBar from "../shared/NavBar.svelte";
  import userStore from "../shared/stores/user-store";
  import Course from "./routes/Course.svelte";
  import CoursesOverview from "./routes/CoursesOverview.svelte";
  import Login from "./routes/Login.svelte";

  const routes = {
    "/": wrap({
      component: CoursesOverview,
      conditions: () => $userStore !== null,
    }),
    "/courses/:courseId": Course,
    "/login": Login,
  };

  function conditionsFailed() {
    replace("/login");
  }
</script>

<NavBar />

<Router {routes} on:conditionsFailed={conditionsFailed} />
