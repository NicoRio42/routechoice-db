<script>
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import Router, { replace } from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";
  import NavBar from "../shared/NavBar.svelte";
  import CoursesOverview from "./routes/CoursesOverview.svelte";
  import Login from "./routes/Login.svelte";

  const auth = getAuth();

  const routes = {
    "/": wrap({
      component: CoursesOverview,
      conditions: async () => {
        const onAuthStateChangedPromise = new Promise((resolve, reject) => {
          onAuthStateChanged(
            auth,
            (user) => {
              resolve(user);
            },
            (err) => {
              reject(err);
            }
          );
        });

        const user = await onAuthStateChangedPromise;
        return user !== null;
      },
    }),
    "/login": Login,
  };

  function conditionsFailed() {
    replace("/login");
  }
</script>

<NavBar />

<Router {routes} on:conditionsFailed={conditionsFailed} />
