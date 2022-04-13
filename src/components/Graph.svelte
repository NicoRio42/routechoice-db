<p class="graph-item">
  A <span class="bar-group">
    <span
      style:opacity="50%"
      style:background-color="blue"
      style:width="86%"
      class="bar"
    />
    <span style:background-color="blue" style:width="80%" class="bar" />
  </span>
</p>

<p class="graph-item">
  B <span class="bar-group">
    <span
      style:opacity="50%"
      style:background-color="yellow"
      style:width="81%"
      class="bar"
    />
    <span style:background-color="yellow" style:width="70%" class="bar" />
  </span>
</p>

<p class="graph-item">
  C <span class="bar-group">
    <span
      style:opacity="50%"
      style:background-color="green"
      style:width="100%"
      class="bar"
    />
    <span style:background-color="green" style:width="96%" class="bar" />
  </span>
</p>

<style>
  .graph-item {
    display: flex;
    align-items: center;
  }

  .bar-group {
    margin-left: 0.5rem;
    position: relative;
    width: 100%;
    height: 0.5rem;
  }

  .bar {
    position: absolute;
    border-radius: 2px;
    height: 100%;
  }
</style>
