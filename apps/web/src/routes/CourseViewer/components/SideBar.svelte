<script lang="ts">
  import type Runner from "shared/o-utils/models/runner";
  import { createEventDispatcher } from "svelte";

  export let selectedRunners: string[];
  export let runners: Runner[];
</script>
