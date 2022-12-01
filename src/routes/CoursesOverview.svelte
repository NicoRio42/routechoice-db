<script lang="ts">
  import {
    collection,
    getDocs,
    getFirestore,
    orderBy,
    query,
  } from "firebase/firestore/lite";
  import { getFunctions, httpsCallable } from "firebase/functions";
  import { push } from "svelte-spa-router";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import Trash from "../../shared/icons/Trash.svelte";
  import type { Course } from "../../shared/models/course";
  import { courseValidator } from "../../shared/models/course";
  import userStore, { isUserAdminStore } from "../../shared/stores/user-store";
  import AddCourseDialog from "../components/AddCourseDialog.svelte";

  let isAddCourseDialogOpen = false;
  let courses: Course[] = [];

  const db = getFirestore();
  const functions = getFunctions(undefined, "europe-west1");
  const deleteCourse = httpsCallable(functions, "deleteCourse");

  getCourses();

  userStore.subscribe((user) => {
    if (user === null) {
      push("/login");
    }
  });

  async function getCourses() {
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, orderBy("date", "desc"));

    const querySnapshot = await getDocs(q);
    const data: Course[] = [];

    querySnapshot.forEach((doc) => {
      try {
        data.push(courseValidator.parse({ ...doc.data(), id: doc.id }));
      } catch (error) {
        console.error(error);
      }
    });

    courses = data;
  }

  async function handleDeleteCourse(course: Course) {
    if (!confirm("Are you sure to delete this course?")) {
      return;
    }

    try {
      await deleteCourse(course);
      courses = courses.filter((c) => c.id !== course.id);
    } catch (error) {
      alert("An error occured while deleting the course.");
      console.error(error);
    }
  }
</script>

<svelte:head>
  <title>Routechoice DB</title>
</svelte:head>

{#if isAddCourseDialogOpen}
  <AddCourseDialog bind:isAddCourseDialogOpen on:onAddCourse={getCourses} />
{/if}

<main class="container" in:fade={{ duration: 500 }}>
  <h1>Courses</h1>

  {#if $isUserAdminStore}
    <button
      on:click={() => (isAddCourseDialogOpen = true)}
      class="add-course-button secondary"
      type="button">Add new course</button
    >
  {/if}

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Date</th>

        {#if $isUserAdminStore}
          <th />
        {/if}
      </tr>
    </thead>

    <tbody>
      {#each courses as course (course.id)}
        <tr animate:flip>
          <td>
            <a class="course-link" href={`/courses/#/${course.id}`}
              >{course.name}</a
            >
          </td>

          <td>{new Date(course.date).toLocaleDateString()}</td>

          {#if $isUserAdminStore}
            <td class="action-row">
              <button
                on:click={() => handleDeleteCourse(course)}
                class="delete-button"
                type="button"><Trash /></button
              >
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
  .add-course-button {
    width: fit-content;
  }

  .course-link {
    margin-right: 1rem;
  }

  .action-row {
    text-align: right;
  }

  .delete-button {
    display: contents;
    background-color: transparent;
    color: var(--h1-color);
    margin: 0;
    padding: 0;
    cursor: pointer;
  }
</style>
