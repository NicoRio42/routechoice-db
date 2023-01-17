<script lang="ts">
  import {
    collection,
    getDocs,
    getFirestore,
    orderBy,
    query,
    where,
  } from "firebase/firestore/lite";
  import { getFunctions, httpsCallable } from "firebase/functions";
  import { replace } from "svelte-spa-router";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import Trash from "../../shared/icons/Trash.svelte";
  import type { Course } from "../../shared/models/course";
  import { courseValidator } from "../../shared/models/course";
  import type { Tag } from "../../shared/models/tag";
  import userStore, { isUserAdminStore } from "../../shared/stores/user-store";
  import AddCourseDialog from "../components/AddCourseDialog.svelte";
  import TagsSelect from "../components/TagsSelect/TagsSelect.svelte";

  let isAddCourseDialogOpen = false;
  let courses: Course[] = [];
  let courseCurrentlyDeletedID: string | null = null;
  let isCourseDeletionLoading = false;
  let loading = false;
  let shortLoading = false;
  let tags: Tag[] = [];
  let pageNumber = 1;

  const db = getFirestore();
  const functions = getFunctions(undefined, "europe-west1");
  const deleteCourse = httpsCallable(functions, "deleteCourse");

  getCourses();

  userStore.subscribe((user) => {
    if (user === null) {
      replace("/login");
    }
  });

  async function getCourses() {
    const coursesRef = collection(db, "courses");

    const queryConstraints = [];
    if (tags.length !== 0)
      queryConstraints.push(where("tags", "array-contains-any", tags));

    queryConstraints.push(orderBy("date", "desc"));
    const q = query(coursesRef, ...queryConstraints);

    loading = true;
    shortLoading = false;

    setTimeout(() => (shortLoading = true), 250);

    try {
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
    } catch (error) {
      alert("An error occured while loading the courses.");
      console.error(error);
    } finally {
      loading = false;
    }
  }

  function getNexCourses() {}

  async function handleDeleteCourse(course: Course) {
    if (!confirm("Are you sure to delete this course?")) {
      return;
    }

    courseCurrentlyDeletedID = course.id;
    isCourseDeletionLoading = true;

    try {
      await deleteCourse(course);
      courses = courses.filter((c) => c.id !== course.id);
    } catch (error) {
      alert("An error occured while deleting the course.");
      console.error(error);
    } finally {
      courseCurrentlyDeletedID = null;
      isCourseDeletionLoading = false;
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

  <TagsSelect bind:tags on:tagsSelect={getCourses} />

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Date</th>
          <th>Tags</th>

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

            <td>
              {#each course.tags as tag}
                <span style:background-color={tag.color} class="tag"
                  >{tag.name}</span
                >
              {/each}
            </td>

            {#if $isUserAdminStore}
              <td class="action-row">
                <button
                  aria-busy={courseCurrentlyDeletedID === course.id &&
                    isCourseDeletionLoading}
                  disabled={isCourseDeletionLoading}
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

    {#if loading && shortLoading}
      <div class="loading-overlay" aria-busy="true" />
    {/if}
  </div>

  <!-- <div class="page-buttons-wrapper">
    <button type="button" class="outline page-button">Previous</button>
    Page {pageNumber}
    <button type="button" class="outline page-button">Next</button>
  </div> -->

  {#if $isUserAdminStore}
    <button
      on:click={() => (isAddCourseDialogOpen = true)}
      class="add-course-button"
      type="button">Add new course</button
    >
  {/if}
</main>

<style>
  .add-course-button {
    width: fit-content;
    margin-top: 1rem;
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

  .table-wrapper {
    overflow-x: auto;
    position: relative;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #00000031;
  }

  .tag {
    margin-right: 0.5rem;
    color: white;
    padding: 0 0.5rem;
    white-space: nowrap;
    border-radius: 0.25rem;
  }

  .page-buttons-wrapper {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 1rem;
  }

  .page-button {
    width: fit-content;
    padding: 0.25rem;
    border: none;
    box-shadow: none;
  }
</style>
