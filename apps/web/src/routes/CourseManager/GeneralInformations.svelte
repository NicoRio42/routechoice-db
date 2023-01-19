<script lang="ts" context="module">
  import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
  import type { Course } from "../../../shared/models/course";
  import { getCourse } from "../../../shared/db/course";
  import TagsSelect from "../../components/TagsSelect/TagsSelect.svelte";
  import { tagSchema, type Tag } from "../../../shared/models/tag";
  import { formatDateForDateInput } from "../../../shared/utils/date";
  import { push } from "svelte-spa-router";

  interface LoadDataArgs {
    params: Record<string, any>;
  }

  const db = getFirestore();

  export async function loadData(args: LoadDataArgs): Promise<Course> {
    const { params } = args;
    return getCourse(params.courseId, db);
  }
</script>

<script lang="ts">
  export let params: { courseId: string };
  let coursePromise: Promise<Course>;
  let name: string;
  let date: string;
  let tags: Tag[] = [];
  let initialTags: Tag[] = [];
  let loading = false;

  coursePromise = loadData({ params });
  init();

  async function init() {
    const course = await coursePromise;
    name = course.name;
    date = formatDateForDateInput(new Date(course.date));
    tags = course.tags;
    initialTags = course.tags;
  }

  function handleTagsSelected(event: CustomEvent<Tag[]>) {
    tags = event.detail;
  }

  async function handleSubmit() {
    const trimedName = name.trim();

    if (trimedName.length === 0) {
      alert("Please enter a valid name");
      return;
    }

    let dateObject: Date;

    try {
      dateObject = new Date(date);
    } catch (error) {
      alert("Wrong date format");
      console.error(error);
      return;
    }

    try {
      tags.forEach((tag) => tagSchema.parse(tag));
    } catch (error) {
      console.error(error);
      alert("Wrong tag format");
      return;
    }

    loading = true;

    try {
      await updateDoc(doc(db, "courses", params.courseId), {
        name: trimedName,
        date: dateObject.getTime(),
        tags,
      });

      push(`/courses/${params.courseId}`);
    } catch (error) {
      console.error(error);
      alert("An error occured while updating the course's informations.");
    } finally {
      loading = false;
    }
  }
</script>

{#await coursePromise then course}
  <main class="container">
    <h1>General informations: {course.name}</h1>

    <form on:submit|preventDefault={handleSubmit}>
      <label for="name"
        >Course name
        <input bind:value={name} type="text" id="name" />
      </label>

      <label for="date"
        >Date
        <input bind:value={date} type="date" id="date" />
      </label>

      <label
        >Tags
        <TagsSelect {initialTags} on:tagsSelect={handleTagsSelected} />
      </label>

      <button
        type="submit"
        aria-busy={loading}
        disabled={loading}
        class="submit-button"
      >
        Change informations
      </button>
    </form>
  </main>
{:catch error}
  <p>Something went wrong: {error.message}</p>
{/await}

<style>
  form {
    width: 50%;
    margin-bottom: 4rem;
  }

  .submit-button {
    width: fit-content;
  }

  @media screen and (max-width: 500px) {
    form {
      width: 100%;
    }
  }
</style>
