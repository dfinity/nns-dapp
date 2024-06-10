<script lang="ts">
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
</script>

<div class="summary" data-tid="projects-summary">
  <h1 class="title">
    <UniversePageSummary universe={$selectedUniverseStore} />
  </h1>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .summary {
    display: flex;
    flex-direction: column;

    margin: 0 0 var(--padding-3x);
  }
</style>
