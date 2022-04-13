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
  <nav class="container-fluid">
    <ul>
      <li><Link to="/">Home</Link></li>
    </ul>

    <ul class="links">
      <li><Link to="about">About</Link></li>
      <li><Link to="blog">Blog</Link></li>
      <li><Link to="login">Login</Link></li>
      <li><Link to="courses">Courses</Link></li>
    </ul>
  </nav>

  <Route path="blog" component={Blog} />
  <Route path="about" component={About} />
  <Route path="/"><Home /></Route>
  <Route path="login"><Login /></Route>
  <Route path="courses"><Course /></Route>
</Router>

<style>
  nav {
    border-bottom: 1px solid lightgray;
  }
  /* 
  nav ul:last-child {
    margin-right: 0;
  } */
</style>
