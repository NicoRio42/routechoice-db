<script>
  import Logo from "./icons/Logo.svelte";
  import userStore, { isUserAdminStore } from "./stores/user-store";
  import { getAuth, signOut } from "firebase/auth";
  import { location, push } from "svelte-spa-router";
  import Hamburger from "./icons/Hamburger.svelte";

  const auth = getAuth();

  async function handleLogout() {
    await signOut(auth);
    // window.location.href = `/#/login?redirectUrl=${$location}`;
  }
</script>

<nav class="container-fluid">
  <ul>
    <li class="logo-item link-list-item">
      <a class="logo-link" href="/#/"><Logo />Routechoice DB</a>
    </li>

    <slot />
  </ul>

  <ul class="large">
    {#if $isUserAdminStore}
      <li class="link-list-item">
        <a href="/#/users">Users</a>
      </li>

      <li class="link-list-item">
        <a href="/#/help">Help</a>
      </li>
    {/if}

    <li class="menu-list-item">
      {#if $userStore === null}
        <a href="/#/login">Login</a>
      {:else}
        <details role="list" dir="rtl">
          <summary aria-haspopup="listbox"> {$userStore?.displayName} </summary>
          <ul>
            <li class="option-item">
              <button on:click={handleLogout}>Logout</button>
            </li>

            <li class="option-item">
              <a href="/#/reset-password">Reset password</a>
            </li>
          </ul>
        </details>
      {/if}
    </li>
  </ul>

  <details role="list" dir="rtl" class="hamburger-menu">
    <summary aria-haspopup="listbox"> <Hamburger /> </summary>
    <ul>
      {#if $userStore !== null}
        <li class="option-item">
          <strong>
            {$userStore?.displayName}
          </strong>
        </li>

        <li class="option-item">
          <button on:click={handleLogout}>Logout</button>
        </li>

        <li class="option-item">
          <a href="/#/reset-password">Reset password</a>
        </li>
      {:else}
        <li>
          <a href="/#/login">Login</a>
        </li>
      {/if}

      {#if $isUserAdminStore}
        <li class="option-item">
          <a href="/#/users">Users</a>
        </li>

        <li class="option-item">
          <a href="/#/help">Help</a>
        </li>
      {/if}
    </ul>
  </details>
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

  .link-list-item {
    padding: calc(var(--nav-element-spacing-vertical) / 2)
      var(--nav-element-spacing-horizontal);
  }

  .hamburger-menu {
    display: none;
    padding: 0;
    margin: 0;
    text-align: left;
  }

  .hamburger-menu summary,
  .hamburger-menu summary:active {
    border: none;
  }

  .hamburger-menu summary:focus {
    box-shadow: none;
  }

  .hamburger-menu summary::after {
    display: none;
  }

  @media screen and (max-width: 500px) {
    .hamburger-menu {
      display: block;
    }

    .large {
      display: none;
    }

    nav {
      padding-right: 0.5rem;
    }
  }
</style>
