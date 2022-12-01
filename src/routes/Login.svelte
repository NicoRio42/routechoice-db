<script lang="ts">
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import CredentialsManagementLayout from "../layouts/CredentialsManagementLayout.svelte";
  import { push, querystring } from "svelte-spa-router";
  import userStore from "../../shared/stores/user-store";
  import PasswordInput from "../components/PasswordInput.svelte";

  const auth = getAuth();
  let redirectUrl: string | null = null;

  if ($querystring) {
    const searchParams = new URLSearchParams($querystring);
    redirectUrl = searchParams.get("redirectUrl");
  }

  let email = "";
  let password = "";
  let loading = false;
  let showErrorMessage = false;

  const handleSubmit = () => {
    loading = true;
    showErrorMessage = false;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        $userStore = userCredential.user;
        push(redirectUrl === null ? "/" : redirectUrl);
      })
      .catch((error) => {
        console.error(`${error.code} ${error.message}`);
        showErrorMessage = true;
      })
      .finally(() => (loading = false));
  };
</script>

<CredentialsManagementLayout pageTitle="Routechoice DB | Login" title="Login">
  <form on:submit|preventDefault={handleSubmit}>
    <label for="email"
      >Email

      <input bind:value={email} id="email" type="email" name="email" required />
    </label>

    <label for="password"
      >Password

      <PasswordInput bind:value={password} id="password" name="password" />
    </label>

    <button
      aria-busy={loading}
      disabled={loading}
      type="submit"
      on:click={handleSubmit}>Login</button
    >

    {#if showErrorMessage}
      <p class="error-message">Wrong email or password</p>
    {/if}
  </form>
</CredentialsManagementLayout>

<style>
  .error-message {
    color: red;
    font-size: smaller;
  }
</style>
