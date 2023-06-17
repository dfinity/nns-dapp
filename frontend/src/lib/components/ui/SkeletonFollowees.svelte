<script lang="ts">
  import { SkeletonText } from "@dfinity/gix-components";
</script>

<div data-tid="skeleton-followees">
  <div class="neuron-id">
    <SkeletonText />
  </div>
  <div class="tags">
    <div class="tag">
      <SkeletonText />
    </div>
    <div class="tag">
      <SkeletonText />
    </div>
    <div class="tag">
      <SkeletonText />
    </div>
  </div>
</div>

<style lang="scss">
  .neuron-id {
    width: calc(16 * var(--padding));
    padding-top: var(--padding-0_5x);
  }

  .tags {
    display: flex;
    gap: var(--padding-0_5x);
    margin-bottom: var(--padding);
    padding-bottom: var(--padding-2x);
  }

  .tag {
    width: calc(var(--padding-8x));
  }
</style>
