<script>
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
</script>

<div data-tid="loading-actionable-proposals-component">
  <div class="headline">
    <SkeletonText />
  </div>
  <div class="card-grid" data-tid="proposals-loading">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
</div>

<style lang="scss">
  .headline {
    margin-bottom: var(--padding-3x);
    width: 210px;
    height: var(--padding-3x);
  }
</style>
