<!-- adapted source: https://github.com/ionic-team/ionic-framework/tree/main/core/src/components/skeleton-text -->
<script lang="ts">
  import Card from "./Card.svelte";
  import SkeletonParagraph from "./SkeletonParagraph.svelte";

  export let size: "medium" | "large" = "medium";
</script>

<Card testId="skeleton-card">
  <div class="small" slot="start">
    <SkeletonParagraph />
  </div>
  <div class="small" slot="end">
    <SkeletonParagraph />
  </div>
  <div class="content">
    <SkeletonParagraph />
    <SkeletonParagraph />
    {#if size === "large"}
      <SkeletonParagraph />
      <SkeletonParagraph />
      <SkeletonParagraph />
      <SkeletonParagraph />
    {/if}
  </div>
</Card>

<style lang="scss">
  .small {
    width: 20%;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding_2x);
  }
</style>
