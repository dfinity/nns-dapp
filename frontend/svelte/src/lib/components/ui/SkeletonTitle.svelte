<script>
  import SkeletonParagraph from "./SkeletonParagraph.svelte";
</script>

<span>
  <SkeletonParagraph />
</span>

<style lang="scss">
  span {
    --skeleton-text-line-height: 2;
  }
</style>
