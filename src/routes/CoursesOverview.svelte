<script lang="ts">
  import {
    collection,
    getDocs,
    getFirestore,
    deleteDoc,
    doc,
    query,
    orderBy,
  } from "firebase/firestore/lite";
  import { push } from "svelte-spa-router";
  import Trash from "../../shared/icons/Trash.svelte";
  import { onMount } from "svelte";
  import userStore from "../../shared/stores/user-store";
  import { fade } from "svelte/transition";
  import AddCourseDialog from "../components/AddCourseDialog.svelte";
  import { flip } from "svelte/animate";
  import { courseValidator } from "../../shared/models/course";
  import type { Course } from "../../shared/models/course";

  let isAddCourseDialogOpen = false;
  let courses: Course[] = [];

  const db = getFirestore();

  onMount(getCourses);

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

  async function deleteCourse(courseId: string) {
    if (!confirm("Are you sure to delete this course?")) {
      return;
    }

    await deleteDoc(doc(db, "courses", courseId));

    courses = courses.filter((course) => course.id !== courseId);
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

  <button
    on:click={() => (isAddCourseDialogOpen = true)}
    class="add-course-button secondary"
    type="button">Add new course</button
  >

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Date</th>
        <th />
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

          <td class="action-row">
            <button
              on:click={() => deleteCourse(course.id)}
              class="delete-button"
              type="button"><Trash /></button
            >
          </td>
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
