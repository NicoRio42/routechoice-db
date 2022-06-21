<script>
  import Router from "svelte-spa-router";
  import Course from "./routes/Course.svelte";

  const routes = {
    "/:courseID": Course,
  };
</script>

<Router {routes} />
