<script lang="ts">
  import { Card, SkeletonText } from "@dfinity/gix-components";
  import SkeletonLogo from "$lib/components/ui/SkeletonLogo.svelte";
</script>

<Card testId="skeleton-card">
  <div class="title" slot="start">
    <SkeletonLogo />
    <SkeletonText />
  </div>
  <div class="desc">
    <SkeletonText />
    <SkeletonText />
  </div>
  <div class="fields">
    <SkeletonText />
    <SkeletonText />
  </div>
</Card>

<style lang="scss">
  .title {
    margin-bottom: var(--padding-1_5x);
    width: 100%;
    height: var(--padding-3x);

    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;

    :global(:first-child) {
      flex: 0 0 var(--padding-4x);
    }
  }

  .desc {
    margin-bottom: var(--padding-1_5x);

    display: flex;
    flex-direction: column;
    gap: var(--padding_2x);
  }

  .fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--padding-8x);
  }
</style>
