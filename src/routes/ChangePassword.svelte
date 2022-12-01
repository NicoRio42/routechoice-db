<script>
  import PasswordInput from "../components/PasswordInput.svelte";
  import CredentialsManagementLayout from "../layouts/CredentialsManagementLayout.svelte";
  import { getAuth, updatePassword } from "firebase/auth";
  import { replace } from "svelte-spa-router";

  const auth = getAuth();

  let loading = false;
  let showMissMatchErrorMessage = false;
  let showPatternErrorMessage = false;
  let newPassword = "";
  let newPasswordCheck = "";

  const uppercaseLowercaseNumberSpecialCharacterMin8Max20Pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  async function handleSubmit() {
    showMissMatchErrorMessage = false;
    showPatternErrorMessage = false;

    const matchPattern =
      uppercaseLowercaseNumberSpecialCharacterMin8Max20Pattern.test(
        newPassword
      );

    if (!matchPattern) {
      showPatternErrorMessage = true;
      return;
    }

    if (newPassword !== newPasswordCheck) {
      showMissMatchErrorMessage = true;
      return;
    }

    loading = true;
    const user = auth.currentUser;

    if (user === null) {
      replace(`/login?redirectUrl=/change-password`);
      return;
    }

    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      alert("An error occured while changing the password.");
      console.error(error);
    } finally {
      loading = false;
      alert("Password updated successfully.");
      replace("/");
    }
  }
</script>

<CredentialsManagementLayout
  pageTitle="Routechoice DB | Change password"
  title="Change password"
>
  <form on:submit|preventDefault={handleSubmit}>
    <label for="new-password"
      >New password
      <PasswordInput
        bind:value={newPassword}
        id="new-password"
        name="new-password"
      />
    </label>

    <label for="password-check"
      >Confirm
      <PasswordInput
        bind:value={newPasswordCheck}
        id="password-check"
        name="password-check"
      />
    </label>

    {#if showMissMatchErrorMessage}
      <p class="error-message">Passwords don't match</p>
    {/if}

    {#if showPatternErrorMessage}
      <p class="error-message">
        Password must include at least one lowercase character, one uppercase
        character, one digit, one special character, and its length must be
        between 8 and 20 characters.
      </p>
    {/if}

    <button
      aria-busy={loading}
      disabled={loading}
      type="submit"
      on:click={handleSubmit}>Change password</button
    >
  </form>
</CredentialsManagementLayout>

<style>
  .error-message {
    color: red;
    font-size: smaller;
  }
</style>
