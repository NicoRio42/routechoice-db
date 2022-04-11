<script lang="ts">
  import { initializeApp } from "firebase/app";

  var firebaseConfig = {
    apiKey: "AIzaSyA8iSKidWsPWa_33vZvVhMjyklaahTar24",
    authDomain: "test-7054d.firebaseapp.com",
    projectId: "test-7054d",
    storageBucket: "test-7054d.appspot.com",
    messagingSenderId: "3420971650",
    appId: "1:3420971650:web:f29fb8155ca24208130a9b",
    measurementId: "G-CN0LBBKJH2",
  };

  const app = initializeApp(firebaseConfig);

  import { Router, Link, Route } from "svelte-routing";
  import Home from "./routes/Home.svelte";
  import About from "./routes/About.svelte";
  import Blog from "./routes/Blog.svelte";
  import Login from "./routes/Login.svelte";
  import Course from "./routes/Course.svelte";

  export let url = "";
</script>

<Router {url}>
  <div class="window">
    <nav>
      <Link to="/">Home</Link>

      <div class="links">
        <Link to="about">About</Link>
        <Link to="blog">Blog</Link>
        <Link to="login">Login</Link>
        <Link to="courses">Courses</Link>
      </div>
    </nav>

    <main>
      <Route path="blog" component={Blog} />
      <Route path="about" component={About} />
      <Route path="/"><Home /></Route>
      <Route path="login"><Login /></Route>
      <Route path="courses"><Course /></Route>
    </main>
  </div>
</Router>

<style>
  .window {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  nav {
    display: flex;
    flex: 0 1 auto;
    justify-content: space-between;
    font-size: 1.5rem;
    background-color: teal;
  }

  nav :global(a) {
    color: white;
  }

  .links {
    display: flex;
    gap: 1rem;
  }

  main {
    min-height: 0;
    flex: 1 1 auto;
  }
</style>
