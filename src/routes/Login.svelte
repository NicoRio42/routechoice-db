<script>
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

  let email;
  let password;

  const handleSubmit = (event) => {
    event.preventDefault();

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        console.log(userCredential.user);
        // ...
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
  };
</script>

<main>
  <article class="login-box">
    <h1>Login</h1>
    <form on:submit={handleSubmit}>
      <label for="email">Email</label>
      <input bind:value={email} id="email" type="email" name="email" required />

      <label for="password">Password</label>
      <input
        bind:value={password}
        type="password"
        id="password"
        name="password"
        required
      />

      <button type="submit" on:click={handleSubmit}>Login</button>
    </form>
  </article>
</main>

<style>
  main {
    flex: 1;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  article {
    margin: 0;
    padding: 1rem;
  }

  h1 {
    margin-bottom: 1rem;
  }

  @media screen and (max-width: 500px) {
    main {
      justify-content: start;
    }

    article {
      width: 100%;
    }
  }
</style>
