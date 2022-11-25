<script lang="ts">
  import Router, {
    replace,
    type ConditionsFailedEvent,
  } from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";
  import NavBar from "../shared/NavBar.svelte";
  import {
    createUserLoggedInPromise,
    isAdmin,
  } from "../shared/stores/user-store";
  import CoursesOverview from "./routes/CoursesOverview.svelte";
  import Help from "./routes/Help.svelte";
  import Login from "./routes/Login.svelte";
  import UsersOverview from "./routes/UsersOverview.svelte";

  const routes = {
    "/": wrap({
      component: CoursesOverview,
      conditions: () => createUserLoggedInPromise(),
    }),
    "/users": wrap({
      component: UsersOverview,
      conditions: () => createUserLoggedInPromise(isAdmin),
    }),
    "/help": wrap({
      component: Help,
      conditions: () => createUserLoggedInPromise(isAdmin),
    }),
    "/login": Login,
  };

  function conditionsFailed(event: ConditionsFailedEvent) {
    replace(`/login?redirectUrl=${event.detail.location}`);
  }
</script>

<NavBar />

<Router {routes} on:conditionsFailed={conditionsFailed} />
