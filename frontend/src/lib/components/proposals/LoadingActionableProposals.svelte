<script>
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
</script>

<TestIdWrapper testId="loading-actionable-proposals-component">
  <div class="headline">
    <SkeletonText />
  </div>
  <div class="card-grid" data-tid="proposals-loading">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
</TestIdWrapper>

<style lang="scss">
  .headline {
    margin-bottom: var(--padding-3x);
    width: 210px;
    height: var(--padding-3x);
  }
</style>
