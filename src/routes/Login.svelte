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

<style>
  .login-box {
    box-shadow: 0px 0px 10px 0px rgba(89, 89, 89, 1);
    border-radius: 3px;
    padding: 1rem;
    margin: 30vh auto 0;
    width: 20rem;
  }

  @media screen and (max-width: 500px) {
    .login-box {
      margin: 0 0 50vh 0;
      width: auto;
    }
  }

  form {
    display: flex;
    flex-direction: column;
  }
</style>
