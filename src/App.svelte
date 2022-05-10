<script>
  import Router, { link } from "svelte-spa-router";
  import Hamburger from "./components/icons/Hamburger.svelte";
  import Logo from "./components/icons/Logo.svelte";
  import { routes } from "./routes";
</script>

<nav class="container-fluid">
  <ul>
    <li>
      <a class="logo-link" href="/" use:link><Logo />Routechoice DB</a>
    </li>
  </ul>

  <ul>
    <li class="large"><a href="/about" use:link>About</a></li>
    <li class="large"><a href="/login" use:link>Login</a></li>
    <li class="large"><a href="/courses" use:link>Courses</a></li>
    <li class="hamburger">
      <details role="list">
        <summary aria-haspopup="listbox">
          <Hamburger />
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
