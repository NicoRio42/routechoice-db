<script>
  import Router from "svelte-spa-router";
  import { link } from "svelte-spa-router";

  import Home from "./routes/Home.svelte";
  import About from "./routes/About.svelte";
  import Login from "./routes/Login.svelte";
  import Course from "./routes/Course.svelte";

  const routes = {
    "/": Course,
    "/home": Home,
    "/about": About,
    "/login": Login,
  };
</script>

<nav class="container-fluid">
  <ul>
    <li>
      <a class="logo-link" href="/home" use:link
        ><svg
          id="svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="400"
          height="400"
          viewBox="0, 0, 400,400"
          ><g id="svgg"
            ><path
              id="path0"
              d="M44.834 8.642 C -9.236 15.598,-16.592 90.812,35.081 108.357 C 62.086 117.526,92.795 101.206,100.469 73.606 L 101.828 68.717 204.625 68.929 L 307.422 69.141 314.844 71.720 C 372.485 91.749,370.139 167.252,311.328 184.854 C 306.948 186.165,299.374 186.288,195.703 186.728 C 74.030 187.244,81.373 186.948,68.180 191.879 C -3.555 218.693,1.397 317.718,75.491 338.101 L 83.203 340.223 158.550 340.446 L 233.897 340.670 215.082 359.593 C 204.734 370.000,196.019 379.337,195.716 380.341 C 193.785 386.730,200.102 393.064,206.641 391.298 C 211.139 390.083,263.300 336.904,263.824 332.999 C 264.468 328.199,263.604 327.172,235.005 298.739 C 205.985 269.888,204.826 269.097,198.916 274.134 C 192.068 279.969,193.526 282.731,214.748 304.124 L 233.176 322.702 158.580 322.484 L 83.984 322.266 78.516 320.428 C 19.492 300.595,20.273 224.977,79.688 206.899 L 85.547 205.116 196.484 204.668 C 316.415 204.184,308.429 204.465,321.484 200.267 C 394.585 176.762,390.757 73.892,316.016 53.327 L 308.203 51.177 204.943 50.960 L 101.684 50.743 100.813 46.682 C 95.722 22.945,69.924 5.415,44.834 8.642 M57.120 26.567 C 83.498 31.490,93.480 64.209,74.419 83.270 C 55.379 102.310,22.242 91.240,18.093 64.453 C 14.614 41.995,34.799 22.401,57.120 26.567 M337.500 281.632 C 305.844 288.752,288.466 324.933,302.668 354.152 C 321.243 392.369,376.462 392.648,394.793 354.618 C 413.613 315.574,379.546 272.174,337.500 281.632 M361.206 300.719 C 383.881 309.619,389.474 339.193,371.662 356.005 C 350.403 376.072,315.678 360.926,315.633 331.568 C 315.598 308.426,339.545 292.216,361.206 300.719 "
            /></g
          ></svg
        >Routechoice DB</a
      >
    </li>
  </ul>

  <ul>
    <li class="large"><a href="/about" use:link>About</a></li>
    <li class="large"><a href="/login" use:link>Login</a></li>
    <li class="large"><a href="/" use:link>Courses</a></li>
    <li class="hamburger">
      <details role="list">
        <summary aria-haspopup="listbox">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
            ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
              d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"
            /></svg
          >
        </summary>

        <ul role="listbox">
          <li><a href="/about" use:link>About</a></li>
          <li><a href="/login" use:link>Login</a></li>
          <li><a href="/" use:link>Courses</a></li>
        </ul>
      </details>
    </li>
  </ul>
</nav>

<Router {routes} />

<style>
  nav {
    border-bottom: 1px solid lightgray;
  }

  .logo-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0;
    font-size: 1.25rem;
    background-color: white;
    color: var(--primary);
  }

  .logo-link svg {
    height: 3rem;
    width: 3rem;
    padding: 0.5rem;
    background-color: var(--primary);
    color: white;
  }

  .hamburger {
    display: none;
  }

  .hamburger summary {
    border: none;
  }

  .hamburger ul {
    left: auto;
  }

  .hamburger summary::after {
    content: none;
  }

  .hamburger svg {
    height: 2rem;
    width: 2rem;
    padding: 0;
  }

  nav ul:first-of-type {
    margin-left: calc(var(--nav-element-spacing-horizontal) * -2);
  }

  nav li {
    padding: calc(var(--nav-element-spacing-vertical) / 2)
      var(--nav-element-spacing-horizontal);
  }

  @media screen and (max-width: 500px) {
    .hamburger {
      display: block;
    }

    .large {
      display: none;
    }

    nav li {
      padding: 0;
    }

    nav ul:first-of-type {
      margin-left: calc(var(--nav-element-spacing-horizontal) * -1);
    }
  }
</style>
