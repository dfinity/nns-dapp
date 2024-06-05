<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
  import { fade } from "svelte/transition";
  import { SVELTE_DEFAULT_ANIMATION_DURATION_IN_MILLISECOND } from "$lib/constants/constants";

  export let universe: Universe;
  export let delay = 0;
  export let noAnimation = false;
</script>

<div class="container" data-tid="universe-with-actionable-proposals-component">
  <div
    in:fade|global={{
      delay,
      duration: noAnimation
        ? 0
        : SVELTE_DEFAULT_ANIMATION_DURATION_IN_MILLISECOND,
    }}
    class="title"
  >
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
