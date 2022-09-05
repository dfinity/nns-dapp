<script>
  import { SkeletonText } from "@dfinity/gix-components";
</script>

<div>
  <SkeletonText />
</div>

<style lang="scss">
  div {
    width: var(--padding-4x);
    height: var(--padding-4x);

    overflow: hidden;
    border-radius: var(--border-radius);

    :global(:first-child) {
      margin: 0;
    }
  }
</style>
