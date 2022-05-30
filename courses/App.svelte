<script>
  import Router from "svelte-spa-router";
  import NavBar from "../shared/NavBar.svelte";
  import Course from "./routes/Course.svelte";

  const routes = {
    "/:courseID": Course,
  };
</script>

<div class="navbar-wrapper">
  <NavBar />
</div>

<Router {routes} />

<style>
  .navbar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 11;
  }
</style>
