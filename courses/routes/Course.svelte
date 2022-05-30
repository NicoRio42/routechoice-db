<script>
  import ActionButtons from "../components/ActionButtons.svelte";
  import SideBar from "../components/SideBar.svelte";
  import { initFromLoggatorURL } from "../utils/2d-rerun-hacks/init-from-loggator-url";
  import { initFromTractracURL } from "../utils/2d-rerun-hacks/init-from-tractrac-url";

  export let params = {};

  //   setTimeout(() => initFromLoggatorURL("https://events.loggator.com/muaoUA"));
  setTimeout(() =>
    initFromTractracURL(
      "https://live.tractrac.com/viewer/index.html?target=https://em.event.tractrac.com/events/d1131c20-76c1-013a-bc67-60a44ce903c3/races/ee8ee5f0-b294-013a-1007-60a44ce903c3.json"
    )
  );
</script>

<SideBar />

<ActionButtons />
