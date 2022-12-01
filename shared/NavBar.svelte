<script>
  import Logo from "./icons/Logo.svelte";
  import userStore, { isUserAdminStore } from "./stores/user-store";
  import { getAuth, signOut } from "firebase/auth";
  import { location, push } from "svelte-spa-router";

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

  <ul>
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
              <a href="/#/change-password">Change password</a>
            </li>
          </ul>
        </details>

        <!-- <button class="logoutButton" type="button" on:click={handleLogout}
          >Logout</button
        > -->
      {/if}
    </li>
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

  .link-list-item {
    padding: calc(var(--nav-element-spacing-vertical) / 2)
      var(--nav-element-spacing-horizontal);
  }

  .logoutButton {
    padding: 0;
    background-color: transparent;
    border: none;
    color: var(--primary);
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
