<script lang="ts">
  import { selectedStepStore } from "./wizardStore";

  export let selectedStepIndex = 0;

  $: {
    selectedStepStore.set(selectedStepIndex);
  }
</script>

<section>
  <slot />
</section>
