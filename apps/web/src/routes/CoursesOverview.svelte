<script lang="ts">
  import {
    collection,
    getDocs,
    getFirestore,
    orderBy,
    query,
  } from "firebase/firestore/lite";
  import { getFunctions, httpsCallable } from "firebase/functions";
  import { SortDirectionEnum } from "../components/Table/sort-direction.enum";
  import { push } from "svelte-spa-router";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import Trash from "../../shared/icons/Trash.svelte";
  import type { Course } from "../../shared/models/course";
  import { courseValidator } from "../../shared/models/course";
  import userStore, { isUserAdminStore } from "../../shared/stores/user-store";
  import AddCourseDialog from "../components/AddCourseDialog.svelte";
  import SorTableHead from "../components/Table/SorTableHead.svelte";

  let isAddCourseDialogOpen = false;
  let courses: Course[] = [];
  let courseCurrentlyDeletedID: string | null = null;
  let isCourseDeletionLoading = false;
  let sort: { key: string; direction: SortDirectionEnum }[] = [
    { key: "date", direction: SortDirectionEnum.DESC },
  ];

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

    const orderByStatements = sort.map((s) =>
      s.direction === SortDirectionEnum.ASC
        ? orderBy(s.key)
        : orderBy(s.key, "desc")
    );

    const q = query(coursesRef, ...orderByStatements);

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

  function handleSortChange(
    event: CustomEvent<null | SortDirectionEnum>,
    key: string
  ) {
    const direction = event.detail;
    sort = sort.filter((s) => s.key !== key);
    if (direction !== null) sort = [{ key, direction }].concat(sort);

    getCourses();
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

  <section class="table-wrapper">
    <table>
      <thead>
        <tr>
          <SorTableHead on:sortChange={(e) => handleSortChange(e, "name")}
            >Name</SorTableHead
          >
          <SorTableHead
            sortDirection={SortDirectionEnum.DESC}
            on:sortChange={(e) => handleSortChange(e, "date")}
            >Date</SorTableHead
          >

          {#if $isUserAdminStore}
            <SorTableHead />
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
  </section>
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

  .table-wrapper {
    overflow-x: auto;
  }
</style>
