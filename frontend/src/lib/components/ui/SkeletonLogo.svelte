<script>
  import { SkeletonText } from "@dfinity/gix-components";
</script>

<div>
  <SkeletonText />
</div>

<style lang="scss">
  div {
    width: var(--skeleton-logo-size, var(--padding-4x));
    height: var(--skeleton-logo-size, var(--padding-4x));

    overflow: hidden;
    border-radius: 50%;

    :global(:first-child) {
      margin: 0;
    }
  }
</style>
