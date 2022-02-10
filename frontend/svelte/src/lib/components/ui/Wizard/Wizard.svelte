<script lang="ts">
  import { onDestroy } from "svelte";

  import { selectedStepStore } from "./wizardStore";

  export function next() {
    selectedStepStore.update((index) => index + 1);
  }

  export function back() {
    selectedStepStore.update((index) => (index > 0 ? index - 1 : index));
  }

  export function subscribe(callback) {
    selectedStepStore.subscribe(callback);
  }

  onDestroy(() => {
    // Clean up, all instances of Wizard use the same store.
    selectedStepStore.set(0);
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
