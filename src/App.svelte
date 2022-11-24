<script lang="ts">
  import Router, { replace } from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";
  import NavBar from "../shared/NavBar.svelte";
  import userStore from "../shared/stores/user-store";
  import CoursesOverview from "./routes/CoursesOverview.svelte";
  import Help from "./routes/Help.svelte";
  import Login from "./routes/Login.svelte";
  import UsersOverview from "./routes/UsersOverview.svelte";

  const routes = {
    "/": wrap({
      component: CoursesOverview,
      conditions: () => $userStore !== null,
    }),
    "/users": wrap({
      component: UsersOverview,
      conditions: () => $userStore !== null,
    }),
    "/help": wrap({
      component: Help,
      conditions: () => $userStore !== null,
    }),
    "/login": Login,
  };

  function conditionsFailed() {
    replace("/login");
  }
</script>

<NavBar />

<Router {routes} on:conditionsFailed={conditionsFailed} />
