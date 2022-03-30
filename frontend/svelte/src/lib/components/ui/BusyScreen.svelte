<script lang="ts">
  import { fade } from "svelte/transition";
  import { busy } from "../../stores/busy.store";
  import Spinner from "./Spinner.svelte";
</script>

<!-- Display spinner and lock UI if busyStore is not empty -->
{#if $busy}
  <div data-tid="busy" transition:fade>
    <Spinner />
  </div>
{/if}

<style lang="scss">
  div {
    z-index: calc(var(--z-index) + 1000);

    position: fixed;
    inset: 0;

    background-color: rgba(var(--background-rgb), 0.75);
  }
</style>
