<script>
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import userStore from "../../shared/stores/user-store";

  const auth = getAuth();

  let email;
  let password;
  let loading = false;
  let showErrorMessage = false;

  const handleSubmit = () => {
    loading = true;
    showErrorMessage = false;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        $userStore = userCredential;
        push("/");
      })
      .catch((error) => {
        console.error(`${error.code} ${error.message}`);
        showErrorMessage = false;
      })
      .finally(() => (loading = false));
  };
</script>

<main class="container" in:fade={{ duration: 500 }}>
  <article>
    <h1>Login</h1>

    <form on:submit|preventDefault={handleSubmit}>
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
    padding-bottom: 0;
  }

  article {
    margin: 0 auto;
    padding: 1rem;
    width: 20rem;
  }

  h1 {
    margin-bottom: 1rem;
  }

  @media screen and (max-width: 500px) {
    article {
      width: 100%;
    }
  }

  .error-message {
    color: red;
  }
</style>
