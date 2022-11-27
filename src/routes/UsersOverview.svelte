<script lang="ts">
  import Trash from "../../shared/icons/Trash.svelte";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import CreateUserDialog from "../components/CreateUserDialog.svelte";
  import { getFunctions, httpsCallable } from "firebase/functions";
  import type User from "../../shared/models/user";

  let isDialogOpen = false;
  let users: User[] = [];

  const functions = getFunctions(undefined, "europe-west1");
  const getUserList = httpsCallable(functions, "getUserList");
  const deleteUser = httpsCallable(functions, "deleteUser");

  async function fetchUsers() {
    try {
      const usersResponse = await getUserList();
      users = usersResponse.data as User[];
    } catch (error) {
      alert("An error occured while loading le list of users.");
      console.error(error);
    }
  }

  async function deleteUserById(userId: string) {
    if (!confirm("Are you sure to delete this user?")) return;

    try {
      await deleteUser(userId);
      users = users.filter((user) => user.id !== userId);
    } catch (error) {
      alert("An error occured while deleting the user");
      console.error(error);
    }
  }

  fetchUsers();
</script>

<svelte:head>
  <title>Routechoice DB | Users</title>
</svelte:head>

{#if isDialogOpen}
  <CreateUserDialog bind:isDialogOpen on:onCreateUser={fetchUsers} />
{/if}

<main class="container" in:fade={{ duration: 500 }}>
  <h1>Users</h1>

  <button class="create-user-button" on:click={() => (isDialogOpen = true)}
    >Create user</button
  >

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
      {#each users as user (user.id)}
        <tr animate:flip>
          <td>
            {user.displayName}
          </td>

          <td>{user.isAdmin ? "Admin" : "User"}</td>

          <td>{user.email}</td>

          <td class="action-row">
            <button
              on:click={() => deleteUserById(user.id)}
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

  .create-user-button {
    width: fit-content;
  }
</style>
