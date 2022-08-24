<script lang="ts">
  import SkeletonParagraph from "./SkeletonParagraph.svelte";
  import SkeletonTitle from "./SkeletonTitle.svelte";
</script>

<div class="loader-title">
  <SkeletonTitle />
</div>
<div class="loader-content">
  <SkeletonParagraph />
  <SkeletonParagraph />
  <SkeletonParagraph />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  .loader-title {
    width: 100%;
    margin-bottom: var(--padding-2x);

    @include media.min-width(medium) {
      width: 50%;
    }
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
