<script lang="ts">
  import { onDestroy } from "svelte";

  import { wizardStore } from "./wizardStore";

  onDestroy(() => {
    // Clean up, all instances of Wizard use the same store.
    wizardStore.set(0);
  });
</script>

<section>
  <slot />
</section>

<style lang="scss">
  section {
    padding: 0;
  }
</style>
