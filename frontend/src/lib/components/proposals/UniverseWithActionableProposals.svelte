<script lang="ts">
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import type { Universe } from "$lib/types/universe";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import type { Snippet } from "svelte";

  type Props = {
    universe: Universe;
    children: Snippet;
  };
  const { children, universe }: Props = $props();
</script>

<div class="container" data-tid="universe-with-actionable-proposals-component">
  <div class="title">
    <UniverseSummary {universe} />
  </div>

  <InfiniteScroll layout="grid" disabled>
    {@render children()}
  </InfiniteScroll>
</div>

<style lang="scss">
  .title {
    margin-bottom: var(--padding-3x);
  }
</style>
