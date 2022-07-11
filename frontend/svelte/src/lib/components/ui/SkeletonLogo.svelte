<script>
  import SkeletonParagraph from "./SkeletonParagraph.svelte";
</script>

<div>
  <SkeletonParagraph />
</div>

<style lang="scss">
  div {
    width: var(--padding-4x);
    height: var(--padding-4x);
    flex: 0 0 var(--padding-4x);

    overflow: hidden;
    border-radius: var(--border-radius);

    :global(:first-child) {
      margin: 0;
    }
  }
</style>
