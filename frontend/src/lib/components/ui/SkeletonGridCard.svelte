<script lang="ts">
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
</script>

<div class="loading">
  <SkeletonCard size="medium" />
</div>

<style lang="scss">
  .loading {
    margin-top: calc(var(--padding-2x) + var(--padding-0_5x));
  }
</style>
