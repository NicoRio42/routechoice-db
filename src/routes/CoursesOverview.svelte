<script>
  import Dialog from "../components/Dialog.svelte";
  import {
    collection,
    addDoc,
    getDocs,
    getFirestore,
    deleteDoc,
    doc,
  } from "firebase/firestore";
  import { userStore } from "../stores/user-store";
  import { replace, link } from "svelte-spa-router";
  import Trash from "../components/icons/Trash.svelte";

  let isNewCourseDialogOpen = false;
  let name = "";
  let twoDRerunUrl = "";
  let courses = [];
  let loading = false;

  const db = getFirestore();

  async function getCourses() {
    const querySnapshot = await getDocs(collection(db, "courses"));
    const data = [];
    querySnapshot.forEach((doc) => data.push({ ...doc.data(), id: doc.id }));
    courses = data;
  }

  if ($userStore !== null) {
    getCourses();
  } else {
    replace("/login");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (name === "") {
      alert("Name is required.");
      return;
    }

    try {
      const url = new URL(twoDRerunUrl);
      if (url.origin !== "https://events.loggator.com") {
        alert("Only loggator is supported yet.");
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
    });

    loading = false;
    isNewCourseDialogOpen = false;

    courses = [
      ...courses,
      {
        name,
        twoDRerunUrl,
        id: docRef.id,
      },
    ];
  }

  /**
   * @param {string} courseId
   */
  async function deleteCourse(courseId) {
    if (!confirm("Are you sure to delete this course?")) {
      return;
    }

    await deleteDoc(doc(db, "courses", courseId));

    courses = courses.filter((course) => course.id !== courseId);
  }
</script>

{#if isNewCourseDialogOpen}
  <Dialog on:closeDialog={() => (isNewCourseDialogOpen = false)}>
    <h3 slot="title">New course</h3>

    <form on:submit={handleSubmit} slot="content">
      <label for="name">Course name</label>
      <input bind:value={name} type="text" id="name" />

      <label for="2d-rerun-url">2D rerun url</label>
      <input bind:value={twoDRerunUrl} type="text" id="2d-rerun-url" />

      <button aria-busy={loading} type="submit">Add new Course</button>
    </form>
  </Dialog>
{/if}

<form />

<main class="container">
  <h1>Courses</h1>

  <button
    on:click={() => (isNewCourseDialogOpen = true)}
    class="add-course-button secondary"
    type="button">Add new course</button
  >

  <ul>
    {#each courses as course}
      <li class="course-item">
        <a class="course-link" href={`/courses/${course.id}`} use:link
          >{course.name}</a
        >

        <button
          on:click={() => deleteCourse(course.id)}
          class="delete-button"
          type="button"><Trash /></button
        >
      </li>
    {/each}
  </ul>
</main>

<style>
  .add-course-button {
    width: fit-content;
  }

  .course-link {
    margin-right: 1rem;
  }

  .delete-button {
    visibility: hidden;
    display: contents;
    background-color: transparent;
    color: var(--h1-color);
    margin: 0;
    padding: 0;
    cursor: pointer;
  }

  .course-item:hover .delete-button {
    visibility: visible;
  }
</style>
