<script lang="ts">
  import Trash from "../../shared/icons/Trash.svelte";
  import { flip } from "svelte/animate";

  import { fade } from "svelte/transition";

  const mockUsers = [
    { id: 1, name: "Toto", email: "Toto@gmail.com", role: "runner" },
    { id: 2, name: "Titi", email: "Titi@gmail.com", role: "runner" },
    { id: 3, name: "Charly", email: "Charly@gmail.com", role: "coach" },
  ];
</script>

<svelte:head>
  <title>Routechoice DB | Users</title>
</svelte:head>

<main class="container" in:fade={{ duration: 500 }}>
  <h1>Users</h1>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Email</th>
        <th />
      </tr>
    </thead>

    <tbody>
      {#each mockUsers as user (user.id)}
        <tr animate:flip>
          <td>
            {user.name}
          </td>

          <td>{user.role}</td>

          <td>{user.email}</td>

          <td class="action-row">
            <button
              on:click={() => console.log("deleted")}
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
  .delete-button {
    display: contents;
    background-color: transparent;
    color: var(--h1-color);
    margin: 0;
    padding: 0;
    cursor: pointer;
  }
</style>
