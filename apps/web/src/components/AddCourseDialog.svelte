<script lang="ts">
  import {
    addDoc,
    collection,
    doc,
    getFirestore,
    setDoc,
  } from "firebase/firestore/lite";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import type { CourseDataWithoutRunners } from "../../shared/o-utils/models/course-data";
  import clickOutside from "../../shared/use/clickOutside";
  import { formatDateForDateInput } from "../../shared/utils/date";
  import TagsSelect from "./TagsSelect/TagsSelect.svelte";
  import type { Tag } from "../../shared/models/tag";

  export let isAddCourseDialogOpen;
  let name = "";
  let liveProviderURL = "";
  let tags: Tag[] = [];

  const today = new Date();
  let date = formatDateForDateInput(today);
  let loading = false;

  const db = getFirestore();

  const allowedOrigins = [
    "https://events.loggator.com",
    "https://live.tractrac.com",
  ];

  const dispatch = createEventDispatcher();

  async function handleSubmit(): Promise<void> {
    if (name === "") {
      alert("Name is required.");
      return;
    }

    let url: URL;
    let id: string;

    try {
      url = new URL(liveProviderURL);

      if (!allowedOrigins.includes(url.origin)) {
        alert("Only Loggator and Tractrac are supported currently.");
        return;
      }

      const lastPathPart = url.pathname.split("/").at(-1);
      if (lastPathPart === undefined) throw new Error("Invalid URL");
      id = `loggator-${lastPathPart}`;
    } catch {
      alert("Wrong format for your url.");
      return;
    }

    const timeStamp = new Date(date).getTime();

    const courseData: CourseDataWithoutRunners = {
      id,
      course: [],
      legs: [],
      map: null,
      timeOffset: 0,
      statistics: null,
    };

    const courseWithoutID = {
      name,
      liveProviderURL: liveProviderURL,
      date: timeStamp,
      tags,
    };

    loading = true;

    try {
      await setDoc(doc(db, "coursesData", id), courseData);
      await setDoc(doc(db, "courses", id), courseWithoutID);
    } catch (error) {
      alert("An error occured while creating the course.");
      console.error(error);
    } finally {
      loading = false;
    }

    dispatch("onAddCourse");
    closeDialog();
  }

  function handleTagsSelected(event: CustomEvent<Tag[]>) {
    tags = event.detail;
  }

  function closeDialog(): void {
    isAddCourseDialogOpen = false;
  }
</script>

<dialog open transition:fade={{ duration: 250 }}>
  <article use:clickOutside={closeDialog}>
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
        <input bind:value={liveProviderURL} type="text" id="2d-rerun-url" />
      </label>

      <label
        >Tags
        <TagsSelect on:tagsSelect={handleTagsSelected} />
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
