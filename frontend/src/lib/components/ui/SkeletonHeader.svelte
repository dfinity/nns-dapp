<script lang="ts">
  import { SkeletonText } from "@dfinity/gix-components";
  import PageHeader from "../common/PageHeader.svelte";
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
