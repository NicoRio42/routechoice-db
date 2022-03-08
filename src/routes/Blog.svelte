<script>
  import { doc, setDoc } from "firebase/firestore";
  import { getFirestore } from "firebase/firestore";

  const db = getFirestore();

  // Add a new document in collection "cities"
  const testFirestore = async () => {
    await setDoc(doc(db, "cities", "LA"), {
      name: "Los Angeles",
      state: "CA",
      country: "USA",
    });
  };
</script>

<h1>Blog</h1>
<button on:click={testFirestore}>Toto</button>
