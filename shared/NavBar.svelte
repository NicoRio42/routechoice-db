<script>
  import Logo from "./icons/Logo.svelte";
</script>

<nav class="container-fluid">
  <ul>
    <li class="logo-item">
      <a class="logo-link" href="/"><Logo />Routechoice DB</a>
    </li>
  </ul>

  <ul>
    <li><a href="/#/login">Login</a></li>
  </ul>
</nav>

<style>
  nav {
    border-bottom: 1px solid lightgray;
    background-color: white;
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

  nav ul:first-of-type {
    margin-left: calc(var(--nav-element-spacing-horizontal) * -2);
  }

  nav li {
    padding: calc(var(--nav-element-spacing-vertical) / 2)
      var(--nav-element-spacing-horizontal);
  }

  @media screen and (max-width: 500px) {
    nav li {
      padding-left: 0;
    }

    nav ul:first-of-type {
      margin-left: calc(var(--nav-element-spacing-horizontal) * -1);
    }
  }
</style>
