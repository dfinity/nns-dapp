<script lang="ts">
  import PageHeader from "$lib/components/common/PageHeader.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
</script>

<PageHeader>
  <div slot="start">
    <SkeletonText />
  </div>
  <div slot="end">
    <SkeletonText />
  </div>
</PageHeader>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  div {
    width: 90%;

    @include media.min-width(small) {
      width: 40%;
    }
  }
</style>
