<script lang="ts" context="module">
  import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
  import { courseValidator, type Course } from "../../../shared/models/course";

  interface LoadDataArgs {
    params: Record<string, any>;
  }

  const db = getFirestore();

  export async function loadData(args: LoadDataArgs): Promise<Course> {
    const { params } = args;
    const docSnap = await getDoc(doc(db, "courses", params.courseId));

    return courseValidator.parse({
      ...docSnap.data(),
      id: params.courseId,
    });
  }
</script>

<script lang="ts">
  export let params: { courseId: string };
  let coursePromise: Promise<Course>;

  coursePromise = loadData({ params });
</script>

{#await coursePromise}
  <p>Loading course...</p>
{:then course}
  <main class="container">
    <h1>{course.name}</h1>

    <div class="wrapper">
      <article>General informations</article>

      <article>Course and routechoices</article>

      <article>Split times</article>
    </div>
  </main>
{:catch error}
  <p>Something went wrong: {error.message}</p>
{/await}

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  article {
    margin: 0;
    cursor: pointer;
  }
</style>
