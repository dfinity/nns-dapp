<script lang="ts">
  import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
</script>

<h1 class="summary" data-tid="projects-summary">
  <UniversePageSummary universe={$selectedUniverseStore} />
</h1>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .summary {
    display: flex;
    flex-direction: column;

    margin: 0 0 var(--padding-3x);
  }
</style>
