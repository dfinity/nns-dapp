<script lang="ts">
  import { Card } from "@dfinity/gix-components";
  import SkeletonParagraph from "./SkeletonParagraph.svelte";
</script>

<Card testId="skeleton-card">
  <div class="title" slot="start">
    <SkeletonParagraph />
  </div>
  <div class="content">
    <SkeletonParagraph />
    <SkeletonParagraph />
    <SkeletonParagraph />
  </div>
</Card>

<style lang="scss">
  .title {
    width: 100%;
    height: var(--padding-3x);
  }

  .content {
    display: grid;
    grid-template-columns: 15% auto 15%;
    gap: var(--padding-3x);
    align-items: center;
    height: var(--padding-4x);

    :global(:nth-child(2)) {
      height: var(--padding-1_5x);
      border-radius: var(--border-radius);
    }
  }
</style>
