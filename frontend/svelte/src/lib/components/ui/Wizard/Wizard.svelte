<script lang="ts">
  import { selectedTabStore } from "./wizardStore";

  export let selectedTabIndex = 0;

  $: {
    selectedTabStore.update(() => selectedTabIndex);
  }
</script>

<section>
  <slot />
</section>
