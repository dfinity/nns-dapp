<script lang="ts">
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
</script>

<h2 class="summary" data-tid="projects-summary">
  <UniverseSummary universe={$selectedUniverseStore} />
</h2>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  h2 {
    font-size: 28px;
  }

  .summary {
    display: flex;
    flex-direction: column;

    margin: 0 0 var(--padding-3x);
  }
</style>
