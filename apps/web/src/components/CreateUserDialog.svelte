<script lang="ts">
  import { getFunctions, httpsCallable } from "firebase/functions";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import clickOutside from "../../shared/use/clickOutside";

  export let isDialogOpen;

  let loading = false;
  let name = "";
  let email = "";
  let password = "";
  let isAdmin = false;

  const functions = getFunctions(undefined, "europe-west1");
  const createUserWithRole = httpsCallable(functions, "createUserWithRole");

  const dispatch = createEventDispatcher();

  async function handleSubmit() {
    if (
      isAdmin &&
      !confirm(
        "Admin user will be able to modify everything in the app. Are you sure you want to create an admin user ?"
      )
    )
      return;

    const [trimedName, trimedEmail] = [name.trim(), email.trim()];

    if (password.includes(" ")) {
      alert("Password should not include spaces.");
      return;
    }

    if (password.length < 6) {
      alert("Password should be at least 6 characters long.");
      return;
    }

    if (trimedName === "" || trimedEmail === "" || password === "") {
      alert("You have to fill all the fields.");
      return;
    }

    loading = true;

    try {
      await createUserWithRole({
        displayName: trimedName,
        email: trimedEmail,
        password,
        isAdmin,
      });

      dispatch("onCreateUser");
    } catch (error) {
      alert("Something went wrong durring user creation.");
      console.error(error);
    } finally {
      loading = false;
      closeDialog();
    }
  }

  function closeDialog(): void {
    isDialogOpen = false;
  }
</script>

<dialog open transition:fade={{ duration: 250 }}>
  <article use:clickOutside={closeDialog}>
    <header>
      <a aria-label="Close" class="close" on:click={closeDialog} />

      <strong>Create user</strong>
    </header>

    <form on:submit|preventDefault={handleSubmit}>
      <label for="name"
        >User name
        <input bind:value={name} type="text" id="name" />
      </label>

      <label for="name"
        >Email
        <input bind:value={email} type="email" id="name" />
      </label>

      <label for="name"
        >Password
        <input bind:value={password} type="text" id="name" />
      </label>

      <label for="name"
        >Admin role
        <input bind:checked={isAdmin} type="checkbox" id="name" />
      </label>

      <footer>
        <button on:click={closeDialog} class="outline" type="button"
          >Cancel</button
        >

        <button disabled={loading} aria-busy={loading} type="submit"
          >Create</button
        >
      </footer>
    </form>
  </article>
</dialog>

<style>
  .close {
    cursor: pointer;
  }

  footer {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
