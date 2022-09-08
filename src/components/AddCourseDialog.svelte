<script>
  import { addDoc, collection, getFirestore } from "firebase/firestore/lite";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import clickOutside from "../../shared/use/clickOutside";

  export let isAddCourseDialogOpen;
  let name = "";
  let twoDRerunUrl = "";
  let date = "";
  let loading = false;

  const db = getFirestore();
  const allowedOrigins = [
    "https://events.loggator.com",
    "https://live.tractrac.com",
  ];

  const dispatch = createEventDispatcher();

  async function handleSubmit() {
    if (name === "") {
      alert("Name is required.");
      return;
    }

    try {
      const url = new URL(twoDRerunUrl);
      if (!allowedOrigins.includes(url.origin)) {
        alert("Only Loggator and Tractrac are supported currently.");
        return;
      }
    } catch {
      alert("Wrong format for your url.");
      return;
    }

    loading = true;

    const docRef = await addDoc(collection(db, "courses"), {
      name,
      twoDRerunUrl,
      date,
    });

    loading = false;

    const newCourse = {
      name,
      twoDRerunUrl,
      id: docRef.id,
      date,
    };

    dispatch("onAddCourse", newCourse);
    closeDialog();
  }

  function closeDialog() {
    isAddCourseDialogOpen = false;
  }
</script>

<dialog open transition:fade={{ duration: 250 }}>
  <article use:clickOutside on:clickOutside={closeDialog}>
    <header>
      <a aria-label="Close" class="close" on:click={closeDialog} />

      <strong>Add course</strong>
    </header>

    <form on:submit|preventDefault={handleSubmit}>
      <label for="name"
        >Course name
        <input bind:value={name} type="text" id="name" />
      </label>

      <label for="date"
        >Date
        <input bind:value={date} type="date" id="date" />
      </label>

      <label for="2d-rerun-url"
        >Loggator or Tractrac URL
        <input bind:value={twoDRerunUrl} type="text" id="2d-rerun-url" />
      </label>

      <footer>
        <button on:click={closeDialog} class="outline" type="button"
          >Cancel</button
        >

        <button aria-busy={loading} type="submit">Add</button>
      </footer>
    </form>
  </article>
</dialog>

<style>
  article {
    width: 30rem;
    padding-bottom: 0;
  }

  footer {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  footer button {
    width: fit-content;
  }

  .close {
    cursor: pointer;
  }
</style>
