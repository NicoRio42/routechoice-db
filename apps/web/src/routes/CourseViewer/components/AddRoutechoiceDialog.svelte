<script lang="ts" context="module">
  import { writable } from "svelte/store";
  import { fade } from "svelte/transition";

  const showDialog = writable(false);
  let submit: Function;
  let cancel: Function;

  export function getNewRoutechoiceNameAndColor(): Promise<[string, string]> {
    showDialog.set(true);

    return new Promise<[string, string]>((resolve, reject) => {
      submit = resolve;
      cancel = reject;
    });
  }
</script>

<script lang="ts">
  let name: string;
  let color: string;

  function handleCancel() {
    cancel();
    $showDialog = false;
  }

  function handleSubmit() {
    submit([name, color]);
    $showDialog = false;
  }
</script>

{#if $showDialog}
  <dialog open transition:fade>
    <article>
      <form on:submit|preventDefault={handleSubmit}>
        <label for="name">
          Name

          <input bind:value={name} type="text" name="name" autofocus required />
        </label>

        <label for="color">
          Color

          <input bind:value={color} type="color" name="color" required />
        </label>

        <footer>
          <button type="button" class="outline" on:click={handleCancel}
            >Cancel</button
          >

          <button type="submit">Add Routechoice</button>
        </footer>
      </form>
    </article>
  </dialog>
{/if}
