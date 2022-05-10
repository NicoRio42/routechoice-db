<script>
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import { push } from "svelte-spa-router";
  import { userStore } from "../stores/user-store";

  const auth = getAuth();

  let email;
  let password;
  let loading = false;
  let showErrorMessage = false;

  /**
   *
   * @param {Event} event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    loading = true;
    showErrorMessage = false;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        userStore.set(userCredential);

        loading = false;
        push("/courses");
      })
      .catch((error) => {
        console.error(`${error.code} ${error.message}`);
        loading = false;
        showErrorMessage = false;
      });
  };
</script>

<main>
  <article class="login-box">
    <h1>Login</h1>
    <form on:submit={handleSubmit}>
      <label for="email">Email</label>
      <input bind:value={email} id="email" type="email" name="email" required />

      <label for="password">Password</label>
      <input
        bind:value={password}
        type="password"
        id="password"
        name="password"
        required
      />

      <button aria-busy={loading} type="submit" on:click={handleSubmit}
        >Login</button
      >

      {#if showErrorMessage}
        <p class="error-message">An error occured during login.</p>
      {/if}
    </form>
  </article>
</main>

<style>
  main {
    flex: 1;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  article {
    margin: 0;
    padding: 1rem;
  }

  h1 {
    margin-bottom: 1rem;
  }

  @media screen and (max-width: 500px) {
    main {
      justify-content: start;
    }

    article {
      width: 100%;
    }
  }

  .error-message {
    color: red;
  }
</style>
