<script lang="ts">
  import { fade } from "svelte/transition";
  import { busyStore } from "../../stores/busy.store";
  import Spinner from "./Spinner.svelte";
</script>

<!-- Display spinner and lock UI if busyStore is not empty -->
{#if $busyStore.size > 0}
  <div transition:fade>
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
