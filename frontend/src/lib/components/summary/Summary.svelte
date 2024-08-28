<script lang="ts">
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
</script>

<h1 class="summary" data-tid="projects-summary">
  <UniverseSummary universe={$selectedUniverseStore} />
</h1>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .summary {
    display: flex;
    flex-direction: column;

    margin: 0 0 var(--padding-3x);
  }
</style>
