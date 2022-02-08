<script lang="ts">
  import { onDestroy } from "svelte";

  import { selectedStepStore } from "./wizardStore";

  export let selectedStepIndex = 0;

  $: {
    selectedStepStore.set(selectedStepIndex);
  }

  onDestroy(() => {
    // Clean up, all instances of Wizard use the same store.
    selectedStepStore.set(0);
  });
</script>

<section>
  <slot />
</section>
