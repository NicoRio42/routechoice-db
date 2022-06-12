{#if navigator.userAgentData.mobile}
  <section class="zoom-wrapper">
    <button
      class="outline zoom-in"
      on:click={() => mapviewer.canvas.zoom(4, "wheel")}>+</button
    >

    <button
      class="outline zoom-out"
      on:click={() => mapviewer.canvas.zoom(-4, "wheel")}>-</button
    >
  </section>
{/if}

<style>
  .zoom-wrapper {
    position: fixed;
    top: 4rem;
    right: 1rem;
    margin: 0;
    padding: 0;
  }

  .zoom-wrapper button {
    margin: 0;
    background-color: white;
    font-size: 2rem;
    padding: 0 0.5rem;
  }

  .zoom-in {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .zoom-out {
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
</style>
