<script lang="ts">
  import { selectedTabStore } from "./wizardStore";

  export let selectedTabIndex = 0;

  $: {
    selectedTabStore.set(selectedTabIndex);
  }
</script>

<section>
  <slot />
</section>
