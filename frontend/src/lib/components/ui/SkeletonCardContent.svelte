<script lang="ts">
  import { SkeletonText } from "@dfinity/gix-components";

  export let size: "small" | "medium" | "large" = "small";
</script>

<div class="content">
  <SkeletonText />
  <SkeletonText />

  {#if ["large", "medium"].includes(size)}
    <SkeletonText />
    <SkeletonText />
  {/if}

  {#if size === "large"}
    <SkeletonText />
    <SkeletonText />
  {/if}
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding_2x);
  }
</style>
