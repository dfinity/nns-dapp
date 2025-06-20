<script lang="ts">
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import type { Universe } from "$lib/types/universe";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import type { Snippet } from "svelte";
  import FetchLimitWarning from "./FetchLimitWarning.svelte";

  type Props = {
    universe: Universe;
    children: Snippet;
    fetchLimitReached: boolean;
  };
  const { children, universe, fetchLimitReached }: Props = $props();
</script>

<div class="container" data-tid="universe-with-actionable-proposals-component">
  <div class="title">
    <UniverseSummary {universe} />
    {#if fetchLimitReached}
      <FetchLimitWarning />
    {/if}
  </div>

  <InfiniteScroll layout="grid" disabled onIntersect={async () => {}}>
    {@render children()}
  </InfiniteScroll>
</div>

<style lang="scss">
  .title {
    margin-bottom: var(--padding-3x);
  }
</style>
