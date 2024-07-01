<script lang="ts">
  import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
  import type { Universe } from "$lib/types/universe";
  import { InfiniteScroll } from "@dfinity/gix-components";

  export let universe: Universe;
</script>

<div class="container" data-tid="universe-with-actionable-proposals-component">
  <div class="title">
    <UniversePageSummary {universe} />
  </div>

  <InfiniteScroll layout="grid" disabled>
    <slot />
  </InfiniteScroll>
</div>

<style lang="scss">
  .title {
    margin-bottom: var(--padding-3x);
  }
</style>
