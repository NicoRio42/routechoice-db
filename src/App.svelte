<script>
  import Router from "svelte-spa-router";
  import NavBar from "../shared/NavBar.svelte";
  import { routes } from "./routes";
</script>

<NavBar />

<Router {routes} />
