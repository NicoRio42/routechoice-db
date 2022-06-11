<script>
  export let data;
  export let suffix = "";

  let max = 0;

  $: max = Math.max(...data.map((item) => item.value));
</script>

{#each data as item}
  <p class="graph-item">
    {item.label}<span class="bar-group">
      <!-- <span
        style:opacity="50%"
        style:background-color={item.color}
        style:width={`${(item.secondValue * 100) / max}%`}
        class="bar"
      /> -->
      <span
        data-tooltip={`${item.value}${suffix}`}
        style:background-color={`#${item.color}`}
        style:width={`${(item.value * 100) / max}%`}
        class="bar"
      />
    </span>
  </p>
{/each}

<style>
  .graph-item {
    display: flex;
    align-items: center;
    padding-right: 1rem;
  }

  .bar-group {
    margin-left: 0.5rem;
    position: relative;
    width: 100%;
    height: 0.5rem;
    border: none;
  }

  .bar {
    position: absolute;
    border-radius: 2px;
    height: 100%;
  }
</style>
